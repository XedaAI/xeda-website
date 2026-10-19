/**
 * ai-gateway: Trust Layer v0 (BS-75). Server-to-server only.
 *
 * Every Xeda product that calls an AI model is meant to go through here. The
 * gateway decides the data tier of the request, replaces direct identifiers
 * with tokens, sends the request only to a model approved for that tier, and
 * swaps the tokens back in the reply. See docs/TRUST_LAYER.md.
 *
 * Auth: callers send `x-gateway-token: <TRUST_GATEWAY_TOKEN>`. verify_jwt is
 * off in config.toml because the platform JWT check would accept the public
 * anon key, which ships in the browser bundle -- that would make this an open
 * model proxy. No CORS headers: browsers are not supposed to call it.
 */
import { handleGatewayRequest, parseRequest } from "../_shared/trust/gateway.ts";
import { routesFromEnv } from "../_shared/trust/policy.ts";

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Compare without leaking the position of the first differing byte. */
function constantTimeEqual(a: string, b: string): boolean {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  let diff = left.length ^ right.length;
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  }
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const expected = Deno.env.get("TRUST_GATEWAY_TOKEN");
  if (!expected) {
    console.error("TRUST_GATEWAY_TOKEN is not configured; refusing all requests.");
    return json({ error: "Gateway not configured" }, 503);
  }
  const presented = req.headers.get("x-gateway-token") ?? "";
  if (!constantTimeEqual(presented, expected)) return json({ error: "Unauthorized" }, 401);

  let input: unknown;
  try {
    input = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const parsed = parseRequest(input);
  if ("error" in parsed) return json({ error: parsed.error }, 400);

  const result = await handleGatewayRequest(
    parsed,
    routesFromEnv((name) => Deno.env.get(name)),
    fetch,
    (entry) => console.log(JSON.stringify(entry)),
  );
  return json(result.body, result.status);
});
