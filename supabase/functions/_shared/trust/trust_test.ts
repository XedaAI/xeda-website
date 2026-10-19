// Unit tests for the Trust Layer v0 modules. Run with:
//   deno test supabase/functions/_shared/trust/
// No remote imports, so the tests run without network access.
import { classify } from "./classify.ts";
import { type AuditEntry, handleGatewayRequest, parseRequest } from "./gateway.ts";
import { routesFromEnv, type RouteTable, selectRoute } from "./policy.ts";
import { isValidIban, isValidSteuerId, pseudonymise, TokenVault } from "./pseudonymise.ts";
import { strictest } from "./tiers.ts";

function assertEquals<T>(actual: T, expected: T, message = ""): void {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${message}\n  expected: ${e}\n  actual:   ${a}`);
}

function assert(condition: unknown, message = "assertion failed"): asserts condition {
  if (!condition) throw new Error(message);
}

// --- tiers -----------------------------------------------------------------

Deno.test("strictest tier wins, empty list is T0", () => {
  assertEquals(strictest(["T1", "T3", "T0"]), "T3");
  assertEquals(strictest([]), "T0");
});

// --- checksums -------------------------------------------------------------

Deno.test("IBAN checksum accepts valid and rejects altered IBANs", () => {
  assert(isValidIban("DE89 3704 0044 0532 0130 00"));
  assert(isValidIban("DE89370400440532013000"));
  assert(!isValidIban("DE89370400440532013001"), "one digit changed must fail");
  assert(!isValidIban("DE00"), "too short must fail");
});

Deno.test("Steuer-ID check digit", () => {
  assert(isValidSteuerId("86095742719"), "published example must pass");
  assert(!isValidSteuerId("86095742718"), "wrong check digit must fail");
  assert(!isValidSteuerId("06095742719"), "leading zero must fail");
});

// --- pseudonymisation ------------------------------------------------------

Deno.test("identifiers are replaced and restored", () => {
  const vault = new TokenVault();
  const input =
    "Bitte an max@example.de, IBAN DE89 3704 0044 0532 0130 00, Tel. +49 179 4158530, Steuer-ID 86095742719.";
  const output = pseudonymise(input, vault);

  assert(!output.includes("max@example.de"), "email must be gone");
  assert(!output.includes("DE89"), "IBAN must be gone");
  assert(!output.includes("4158530"), "phone must be gone");
  assert(!output.includes("86095742719"), "Steuer-ID must be gone");
  assert(output.includes("‹EMAIL_1›") && output.includes("‹IBAN_1›"), output);
  assert(output.includes("‹PHONE_1›") && output.includes("‹STEUER_ID_1›"), output);
  assertEquals(vault.restore(output), input, "round trip");
});

Deno.test("same value gets the same token across messages", () => {
  const vault = new TokenVault();
  const a = pseudonymise("Mail max@example.de", vault);
  const b = pseudonymise("Again: max@example.de and eva@example.de", vault);
  assertEquals(a, "Mail ‹EMAIL_1›");
  assertEquals(b, "Again: ‹EMAIL_1› and ‹EMAIL_2›");
  assertEquals(vault.counts(), { EMAIL: 2 });
});

Deno.test("an invalid IBAN-shaped string is left alone", () => {
  const vault = new TokenVault();
  assertEquals(pseudonymise("Ref DE89370400440532013001", vault), "Ref DE89370400440532013001");
  assertEquals(vault.detections.length, 0);
});

Deno.test("dates, amounts and short numbers are not taken for phone numbers", () => {
  const vault = new TokenVault();
  const text = "Termin am 01.10.2026 um 14:30, Betrag 1500 EUR, Zimmer 12";
  assertEquals(pseudonymise(text, vault), text);
});

Deno.test("KVNR is detected as health data", () => {
  const vault = new TokenVault();
  assertEquals(pseudonymise("Versichertennummer A123456780", vault), "Versichertennummer ‹KVNR_1›");
  assertEquals(vault.detections[0].tier, "T3");
});

// --- classification --------------------------------------------------------

Deno.test("website chat without identifiers is T1", () => {
  assertEquals(classify("website-chat", ["What does Xeda offer?"], []).tier, "T1");
});

Deno.test("public content stays T0", () => {
  assertEquals(classify("public-content", ["Write a LinkedIn post about AI"], []).tier, "T0");
});

Deno.test("an unknown purpose is treated as T3", () => {
  const result = classify("something-new", ["hello"], []);
  assertEquals(result.tier, "T3");
  assert(result.reasons.includes("purpose:unknown=T3"));
});

Deno.test("one health marker makes the whole request T3", () => {
  const result = classify("website-chat", ["Hallo", "Meine Diagnose ist Diabetes"], []);
  assertEquals(result.tier, "T3");
  assert(result.reasons.includes("marker:health"));
});

Deno.test("financial markers and umlauts give T2", () => {
  assertEquals(classify("website-chat", ["Hier ist meine Steuererklärung"], []).tier, "T2");
  assertEquals(classify("website-chat", ["Anbei die Rechnungen"], []).tier, "T2");
});

Deno.test("§ 203 counts as professional secret", () => {
  assertEquals(classify("website-chat", ["Das fällt unter § 203 StGB"], []).tier, "T3");
});

Deno.test("detections raise the tier", () => {
  assertEquals(classify("public-content", ["x"], [{ kind: "IBAN", tier: "T2" }]).tier, "T2");
});

// --- policy ----------------------------------------------------------------

const ROUTE_T1 = { id: "eu-api", url: "https://t1.example/v1/chat/completions", model: "m1", apiKey: "k1" };
const ROUTE_T3 = { id: "self-hosted", url: "https://t3.example/v1/chat/completions", model: "m3", apiKey: "k3" };

Deno.test("routes are read only when url, model and key are all set", () => {
  const env: Record<string, string> = {
    TRUST_ROUTE_T1_URL: ROUTE_T1.url,
    TRUST_ROUTE_T1_MODEL: ROUTE_T1.model,
    TRUST_ROUTE_T1_KEY: ROUTE_T1.apiKey,
    TRUST_ROUTE_T1_ID: ROUTE_T1.id,
    TRUST_ROUTE_T2_URL: "https://incomplete.example",
  };
  const table = routesFromEnv((name) => env[name]);
  assertEquals(Object.keys(table), ["T1"]);
  assertEquals(table.T1, ROUTE_T1);
});

Deno.test("a weaker tier may use a stricter route, never the reverse", () => {
  const routes: RouteTable = { T3: ROUTE_T3 };
  assertEquals(selectRoute("T1", routes)?.route.id, "self-hosted");
  assertEquals(selectRoute("T3", { T1: ROUTE_T1 }), null);
});

Deno.test("the least strict adequate route is chosen", () => {
  assertEquals(selectRoute("T1", { T1: ROUTE_T1, T3: ROUTE_T3 })?.route.id, "eu-api");
  assertEquals(selectRoute("T2", { T1: ROUTE_T1, T3: ROUTE_T3 })?.route.id, "self-hosted");
});

// --- gateway ---------------------------------------------------------------

function fakeProvider(reply: (sent: { messages: { content: string }[] }) => string) {
  const calls: { url: string; body: { model: string; messages: { content: string }[] } }[] = [];
  const fn = ((url: string, init: RequestInit) => {
    const body = JSON.parse(String(init.body));
    calls.push({ url, body });
    return Promise.resolve(
      new Response(JSON.stringify({ choices: [{ message: { content: reply(body) } }] }), { status: 200 }),
    );
  }) as unknown as typeof fetch;
  return { fn, calls };
}

Deno.test("parseRequest rejects bad input", () => {
  assert("error" in parseRequest({}));
  assert("error" in parseRequest({ purpose: "website-chat", messages: [] }));
  assert("error" in parseRequest({ purpose: "website-chat", messages: [{ role: "tool", content: "x" }] }));
  assert(!("error" in parseRequest({ purpose: "website-chat", messages: [{ role: "user", content: "hi" }] })));
});

Deno.test("gateway sends tokens out and restores them in the reply", async () => {
  const provider = fakeProvider((sent) => `Received: ${sent.messages[0].content}`);
  const audits: AuditEntry[] = [];
  const result = await handleGatewayRequest(
    { purpose: "website-chat", messages: [{ role: "user", content: "Reach me at max@example.de" }] },
    { T1: ROUTE_T1 },
    provider.fn,
    (entry) => audits.push(entry),
  );

  assertEquals(provider.calls.length, 1);
  assertEquals(provider.calls[0].url, ROUTE_T1.url);
  assertEquals(provider.calls[0].body.messages[0].content, "Reach me at ‹EMAIL_1›", "provider must only see tokens");
  assertEquals(result.status, 200);
  if (result.status !== 200) return;
  assertEquals(result.body.content, "Received: Reach me at max@example.de");
  assertEquals(result.body.tier, "T1");
  assertEquals(audits[0].outcome, "ok");
  assert(!JSON.stringify(audits).includes("max@example.de"), "audit line must not contain content");
});

Deno.test("gateway refuses a T3 request when only a T1 route exists", async () => {
  const provider = fakeProvider(() => "should not be called");
  const audits: AuditEntry[] = [];
  const result = await handleGatewayRequest(
    { purpose: "website-chat", messages: [{ role: "user", content: "Mein Befund vom Arzt" }] },
    { T1: ROUTE_T1 },
    provider.fn,
    (entry) => audits.push(entry),
  );
  assertEquals(result.status, 422);
  assertEquals(provider.calls.length, 0, "no provider call on refusal");
  assertEquals(audits[0].outcome, "refused");
});

Deno.test("gateway refuses everything when no routes are configured", async () => {
  const provider = fakeProvider(() => "x");
  const result = await handleGatewayRequest(
    { purpose: "public-content", messages: [{ role: "user", content: "hello" }] },
    {},
    provider.fn,
    () => {},
  );
  assertEquals(result.status, 422);
  assertEquals(provider.calls.length, 0);
});

Deno.test("provider errors become 502 without leaking content", async () => {
  const failing = (() => Promise.resolve(new Response("boom", { status: 500 }))) as unknown as typeof fetch;
  const audits: AuditEntry[] = [];
  const result = await handleGatewayRequest(
    { purpose: "website-chat", messages: [{ role: "user", content: "hi" }] },
    { T1: ROUTE_T1 },
    failing,
    (entry) => audits.push(entry),
  );
  assertEquals(result.status, 502);
  assertEquals(audits[0].outcome, "provider-error");
});
