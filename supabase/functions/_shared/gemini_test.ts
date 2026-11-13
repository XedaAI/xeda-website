import {
  assert,
  assertEquals,
  assertRejects,
  assertThrows,
} from "https://deno.land/std@0.168.0/testing/asserts.ts";
import {
  geminiFetch,
  parseServiceAccount,
  ProviderNotConfigured,
  signAssertion,
  toChatCompletionStream,
  vertexUrl,
} from "./gemini.ts";

// deno test --allow-env supabase/functions/_shared/gemini_test.ts
// No network: nothing here reaches Google.

Deno.test("the EU multi-region uses the .rep. hostname", () => {
  assertEquals(
    vertexUrl("eu", "xeda-site", "gemini-3.8-flash", "streamGenerateContent"),
    "https://aiplatform.eu.rep.googleapis.com/v1/projects/xeda-site/locations/eu/publishers/google/models/gemini-3.8-flash:streamGenerateContent",
  );
});

Deno.test("a region in a member state uses its regional hostname", () => {
  assertEquals(
    vertexUrl("europe-west3", "xeda-site", "gemini-3.5-flash", "generateContent"),
    "https://europe-west3-aiplatform.googleapis.com/v1/projects/xeda-site/locations/europe-west3/publishers/google/models/gemini-3.5-flash:generateContent",
  );
});

Deno.test("locations outside the EU are refused", () => {
  // London and Zurich are in Europe, not in the EU; global may process anywhere.
  for (const location of ["global", "us", "us-central1", "europe-west2", "europe-west6", ""]) {
    assertThrows(
      () => vertexUrl(location, "xeda-site", "gemini-3.8-flash", "generateContent"),
      ProviderNotConfigured,
    );
  }
});

Deno.test("without Vertex credentials nothing is sent, and nothing falls back", async () => {
  Deno.env.delete("AI_PROVIDER");
  Deno.env.delete("GOOGLE_SERVICE_ACCOUNT_JSON");
  // A Developer API key lying around must not be picked up by default.
  Deno.env.set("GEMINI_API_KEY", "would-go-to-the-usa");
  await assertRejects(
    () => geminiFetch("gemini-3.8-flash", "generateContent", {}),
    ProviderNotConfigured,
  );
  Deno.env.delete("GEMINI_API_KEY");
});

Deno.test("a key file that is not a service account is refused", () => {
  assertThrows(() => parseServiceAccount(undefined), ProviderNotConfigured);
  assertThrows(() => parseServiceAccount("not json"), ProviderNotConfigured);
  assertThrows(() => parseServiceAccount('{"client_email":"a@b"}'), ProviderNotConfigured);
});

Deno.test("the assertion is an RS256 JWT Google's token endpoint accepts", async () => {
  const pair = await crypto.subtle.generateKey(
    { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["sign", "verify"],
  );
  const pkcs8 = new Uint8Array(await crypto.subtle.exportKey("pkcs8", pair.privateKey));
  const body = btoa(String.fromCharCode(...pkcs8)).replace(/(.{64})/g, "$1\n");
  const account = {
    client_email: "chat@xeda-site.iam.gserviceaccount.com",
    project_id: "xeda-site",
    // As it appears in a downloaded key file.
    private_key: `-----BEGIN PRIVATE KEY-----\n${body}\n-----END PRIVATE KEY-----\n`,
  };

  const jwt = await signAssertion(account, 1_800_000_000);
  const [header, claims, signature] = jwt.split(".");
  const decode = (part: string) =>
    Uint8Array.from(atob(part.replace(/-/g, "+").replace(/_/g, "/")), (char) => char.charCodeAt(0));
  const json = (part: string) => JSON.parse(new TextDecoder().decode(decode(part)));

  assertEquals(json(header), { alg: "RS256", typ: "JWT" });
  assertEquals(json(claims), {
    iss: "chat@xeda-site.iam.gserviceaccount.com",
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    iat: 1_800_000_000,
    exp: 1_800_003_600,
  });
  assert(
    await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      pair.publicKey,
      decode(signature),
      new TextEncoder().encode(`${header}.${claims}`),
    ),
    "signature does not verify against the public key",
  );
});

Deno.test("Gemini's stream becomes the chunks the chat widget parses", async () => {
  const events = [
    'data: {"candidates":[{"content":{"parts":[{"text":"thinking…","thought":true}]}}]}\r\n\r\n',
    'data: {"candidates":[{"content":{"parts":[{"text":"Das Audit "}]}}]}\r\n\r\n',
    'data: {"candidates":[{"content":{"parts":[{"text":"ist kostenlos."}]},"finishReason":"STOP"}]}',
  ].join("");
  // Split mid-event and mid-character, as the network does.
  const bytes = new TextEncoder().encode(events);
  const source = new ReadableStream<Uint8Array>({
    start(controller) {
      for (let i = 0; i < bytes.length; i += 37) controller.enqueue(bytes.slice(i, i + 37));
      controller.close();
    },
  });

  const out = await new Response(toChatCompletionStream(source)).text();
  assertEquals(
    out,
    'data: {"choices":[{"delta":{"content":"Das Audit "}}]}\n\n' +
      'data: {"choices":[{"delta":{"content":"ist kostenlos."}}]}\n\n' +
      "data: [DONE]\n\n",
  );
});
