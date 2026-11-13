// Go-live check for the chat's AI provider: Gemini on Vertex AI, inside the EU.
//
// Run it once after creating the Google Cloud project and its service account,
// and before setting GOOGLE_SERVICE_ACCOUNT_JSON in Supabase:
//
//   node scripts/vertex-smoke.mjs path/to/service-account.json [location]
//
// It makes the two calls the edge functions make (a streamed chat answer and a
// transcription of a recorded question) with the same models and the same
// request bodies, against the same endpoint. That is the part that cannot be
// tested without credentials: whether the key works, whether the account may
// call the models, and whether the EU endpoint serves them.
//
// Keep the key file outside the repository. Neither it nor the access token is
// printed. The location defaults to "eu", like the functions.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [keyFile, location = "eu"] = process.argv.slice(2);
if (!keyFile) {
  console.error("Usage: node scripts/vertex-smoke.mjs path/to/service-account.json [location]");
  process.exit(1);
}

const account = JSON.parse(fs.readFileSync(keyFile, "utf8"));
const chatSrc = fs.readFileSync(`${REPO}/supabase/functions/chat/index.ts`, "utf8");
const sttSrc = fs.readFileSync(`${REPO}/supabase/functions/speech-to-text/index.ts`, "utf8");
const CHAT_MODEL = chatSrc.match(/CHAT_MODEL"\) \?\? "([^"]+)"/)[1];
const THINKING = chatSrc.match(/CHAT_THINKING_LEVEL"\) \?\? "([^"]*)"/)[1];
const STT_MODEL = sttSrc.match(/STT_MODEL"\) \?\? "([^"]+)"/)[1];
const TRANSCRIBE = sttSrc.match(/const TRANSCRIBE_INSTRUCTION = `([\s\S]*?)`\.trim\(\);/)[1].trim();

// Same rule as vertexUrl() in supabase/functions/_shared/gemini.ts.
const host = location === "eu" ? "aiplatform.eu.rep.googleapis.com" : `${location}-aiplatform.googleapis.com`;
const modelUrl = (model, method) =>
  `https://${host}/v1/projects/${account.project_id}/locations/${location}/publishers/google/models/${model}:${method}`;

const base64Url = (value) => Buffer.from(value).toString("base64url");
async function accessToken() {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = [
    base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" })),
    base64Url(JSON.stringify({
      iss: account.client_email,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })),
  ].join(".");
  const signature = crypto.createSign("RSA-SHA256").update(unsigned).sign(account.private_key, "base64url");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
  });
  if (!response.ok) throw new Error(`token request: ${response.status} ${await response.text()}`);
  return (await response.json()).access_token;
}

let failed = false;
const report = (ok, name, detail) => {
  if (!ok) failed = true;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}\n      ${detail}`);
};

console.log(`project ${account.project_id}, location ${location} (${host})\n`);
let headers;
try {
  headers = { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json" };
  report(true, "service account can sign in", account.client_email);
} catch (error) {
  report(false, "service account can sign in", error.message);
  process.exit(1);
}

// 1. The chat answer, streamed.
{
  const started = Date.now();
  const response = await fetch(`${modelUrl(CHAT_MODEL, "streamGenerateContent")}?alt=sse`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: "Antworte in einem kurzen Satz auf Deutsch." }] },
      contents: [{ role: "user", parts: [{ text: "Was ist die Hauptstadt von Rheinland-Pfalz?" }] }],
      generationConfig: THINKING ? { thinkingConfig: { thinkingLevel: THINKING } } : {},
    }),
  });
  const body = await response.text();
  const text = body
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .flatMap((line) => JSON.parse(line.slice(5)).candidates?.[0]?.content?.parts ?? [])
    .filter((part) => !part.thought && part.text)
    .map((part) => part.text)
    .join("");
  report(
    response.ok && /Mainz/i.test(text),
    `chat: ${CHAT_MODEL}, streamed${THINKING ? `, thinking ${THINKING}` : ""}`,
    response.ok ? `${Date.now() - started} ms: ${text.trim()}` : `${response.status} ${body.slice(0, 400)}`,
  );
}

// 2. The transcription of a WebM recording, as Chrome produces it.
{
  const audio = fs.readFileSync(`${REPO}/scripts/fixtures/voice-question-de.webm`);
  const started = Date.now();
  const response = await fetch(modelUrl(STT_MODEL, "generateContent"), {
    method: "POST",
    headers,
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: TRANSCRIBE }] },
      contents: [{ role: "user", parts: [{ inlineData: { mimeType: "audio/webm", data: audio.toString("base64") } }] }],
      generationConfig: {
        temperature: 0,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: { text: { type: "STRING" }, language: { type: "STRING" } },
          required: ["text", "language"],
        },
      },
    }),
  });
  const body = await response.text();
  let result = {};
  try {
    result = JSON.parse(JSON.parse(body).candidates[0].content.parts[0].text);
  } catch { /* reported below */ }
  report(
    response.ok && /Umsetzung/.test(result.text ?? "") && result.language === "de",
    `voice: ${STT_MODEL}, WebM recording`,
    response.ok ? `${Date.now() - started} ms: ${JSON.stringify(result)}` : `${response.status} ${body.slice(0, 400)}`,
  );
}

// 3. Google keeps prompts in a cache for up to 24 hours unless the project
//    turns that off. Informational: it needs no change to the functions.
{
  const response = await fetch(`https://us-central1-aiplatform.googleapis.com/v1/projects/${account.project_id}/cacheConfig`, { headers });
  const config = response.ok ? await response.json() : null;
  console.log(
    `\nINFO  prompt caching: ${
      config
        ? (config.disableCache ? "disabled for this project" : "ENABLED (Google's default; see docs/SUPABASE.md to disable)")
        // Expected: the Vertex AI User role may use models, not read project settings.
        : `this service account may not read the setting (${response.status}); check it with your own login, see docs/SUPABASE.md`
    }`,
  );
}

console.log(failed ? "\nNot ready: fix the FAIL lines before going live." : "\nReady: set GOOGLE_SERVICE_ACCOUNT_JSON in Supabase.");
process.exit(failed ? 1 : 0);
