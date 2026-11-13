/**
 * Gemini for the website chat and its voice input, through Google Cloud
 * (Vertex AI) inside the EU.
 *
 * The Gemini Developer API (generativelanguage.googleapis.com, an AI Studio
 * key) processes in the USA. Visitors' messages and voice recordings are
 * personal data, so production goes through Vertex AI's "eu" multi-region
 * endpoint instead, where Google states that ML processing stays within EU
 * member states:
 * https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/data-residency
 *
 * Both APIs take the same request body, so only the address and the
 * credential differ:
 *
 *   AI_PROVIDER=vertex (default)   GOOGLE_SERVICE_ACCOUNT_JSON, VERTEX_LOCATION
 *   AI_PROVIDER=gemini-api         GEMINI_API_KEY -- development only (USA)
 *
 * There is no fallback from one to the other. Without Vertex credentials the
 * functions answer "not configured" rather than quietly sending a visitor's
 * message somewhere the privacy policy does not name.
 */

export type GeminiMethod = "generateContent" | "streamGenerateContent";

export class ProviderNotConfigured extends Error {}

const DEVELOPER_API = "https://generativelanguage.googleapis.com/v1beta";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/cloud-platform";

// The policy says "within the EU", so the code holds the line: the EU
// multi-region, or a region in a member state. London (europe-west2) and
// Zurich (europe-west6) are in Europe but not in the EU, and "global" may
// process anywhere.
const EU_LOCATIONS = new Set([
  "eu",
  "europe-west1", // Belgium
  "europe-west3", // Frankfurt
  "europe-west4", // Netherlands
  "europe-west8", // Milan
  "europe-west9", // Paris
  "europe-west10", // Berlin
  "europe-west12", // Turin
  "europe-southwest1", // Madrid
  "europe-north1", // Finland
  "europe-north2", // Stockholm
  "europe-central2", // Warsaw
]);
// gemini-3.8-flash and gemini-3.5-flash-lite are processed EU-wide, not in a
// single country, so the multi-region is the endpoint that serves them.
const DEFAULT_LOCATION = "eu";

export interface ServiceAccount {
  client_email: string;
  private_key: string;
  project_id: string;
}

/** Where a model lives on Vertex AI. Multi-regions use the ".rep." hostname. */
export function vertexUrl(location: string, project: string, model: string, method: GeminiMethod): string {
  if (!EU_LOCATIONS.has(location)) {
    throw new ProviderNotConfigured(`VERTEX_LOCATION "${location}" is not an EU location`);
  }
  const host = location === "eu"
    ? "aiplatform.eu.rep.googleapis.com"
    : `${location}-aiplatform.googleapis.com`;
  return `https://${host}/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:${method}`;
}

export function parseServiceAccount(json: string | undefined): ServiceAccount {
  if (!json) throw new ProviderNotConfigured("GOOGLE_SERVICE_ACCOUNT_JSON is not set");
  let account: Partial<ServiceAccount>;
  try {
    account = JSON.parse(json);
  } catch {
    throw new ProviderNotConfigured("GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON");
  }
  if (!account.client_email || !account.private_key || !account.project_id) {
    throw new ProviderNotConfigured("GOOGLE_SERVICE_ACCOUNT_JSON is not a service account key");
  }
  return account as ServiceAccount;
}

const base64Url = (data: Uint8Array | string) => {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

/**
 * The signed JWT a service account trades for an access token.
 * https://developers.google.com/identity/protocols/oauth2/service-account#httprest
 */
export async function signAssertion(account: ServiceAccount, nowSeconds: number): Promise<string> {
  const pem = account.private_key.replace(/-----[A-Z ]+-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pem), (char) => char.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8",
    der,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const unsigned = [
    base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" })),
    base64Url(JSON.stringify({
      iss: account.client_email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: nowSeconds,
      exp: nowSeconds + 3600,
    })),
  ].join(".");
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned),
  );
  return `${unsigned}.${base64Url(new Uint8Array(signature))}`;
}

// Access tokens last an hour. One is kept per warm isolate and renewed a
// minute early; concurrent requests share the renewal.
let cached: { token: string; expiresAt: number } | null = null;
let renewing: Promise<string> | null = null;

async function accessToken(account: ServiceAccount): Promise<string> {
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;

  renewing ??= (async () => {
    try {
      const response = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          assertion: await signAssertion(account, Math.floor(Date.now() / 1000)),
        }),
      });
      if (!response.ok) {
        // The body names the reason (disabled key, clock skew) and no secret.
        throw new Error(`Google token request failed: ${response.status} ${await response.text()}`);
      }
      const { access_token, expires_in } = await response.json();
      cached = { token: access_token, expiresAt: Date.now() + expires_in * 1000 };
      return cached.token;
    } finally {
      renewing = null;
    }
  })();
  return renewing;
}

/**
 * Call a Gemini model. `body` is the native generateContent request, the same
 * for both providers. Streaming comes back as server-sent events.
 */
export async function geminiFetch(model: string, method: GeminiMethod, body: unknown): Promise<Response> {
  const provider = Deno.env.get("AI_PROVIDER") ?? "vertex";
  const query = method === "streamGenerateContent" ? "?alt=sse" : "";
  const init = { method: "POST", body: JSON.stringify(body) };

  if (provider === "gemini-api") {
    const key = Deno.env.get("GEMINI_API_KEY");
    if (!key) throw new ProviderNotConfigured("GEMINI_API_KEY is not set");
    return fetch(`${DEVELOPER_API}/models/${model}:${method}${query}`, {
      ...init,
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
    });
  }
  if (provider !== "vertex") {
    throw new ProviderNotConfigured(`AI_PROVIDER "${provider}" is not supported`);
  }

  const account = parseServiceAccount(Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON"));
  const location = Deno.env.get("VERTEX_LOCATION") ?? DEFAULT_LOCATION;
  const url = vertexUrl(location, account.project_id, model, method);
  return fetch(`${url}${query}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${await accessToken(account)}`,
      "Content-Type": "application/json",
    },
  });
}

/**
 * Re-shape Gemini's event stream into the OpenAI chunk format the chat widget
 * already parses (`choices[0].delta.content`, then `[DONE]`), so the frontend
 * does not change with the provider.
 */
export function toChatCompletionStream(source: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const emit = (line: string, controller: TransformStreamDefaultController<Uint8Array>) => {
    if (!line.startsWith("data:")) return;
    let event: { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[] };
    try {
      event = JSON.parse(line.slice(5));
    } catch {
      return;
    }
    const content = (event.candidates?.[0]?.content?.parts ?? [])
      // The model's reasoning is not part of the answer.
      .filter((part) => !part.thought && typeof part.text === "string")
      .map((part) => part.text)
      .join("");
    if (!content) return;
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`));
  };

  return source.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? "";
        for (const line of lines) emit(line, controller);
      },
      flush(controller) {
        emit(buffer, controller);
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      },
    }),
  );
}
