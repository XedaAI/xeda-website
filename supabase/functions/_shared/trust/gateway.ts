/**
 * Trust Layer gateway core: classify -> pseudonymise -> route -> restore.
 *
 * Kept free of Deno.serve and environment access so it can be unit-tested with
 * a fake fetch. ai-gateway/index.ts is the thin HTTP wrapper around it.
 */
import { classify } from "./classify.ts";
import { pseudonymise, TokenVault } from "./pseudonymise.ts";
import { type RouteTable, selectRoute } from "./policy.ts";
import type { Tier } from "./tiers.ts";

export const GATEWAY_LIMITS = {
  messages: 50,
  totalChars: 50_000,
} as const;

export interface GatewayMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GatewayRequest {
  purpose: string;
  messages: GatewayMessage[];
}

export type GatewayResult =
  | { status: 200; body: { tier: Tier; route: string; content: string } }
  | { status: 400 | 422 | 502; body: { error: string; tier?: Tier } };

/** One structured, content-free line per request. The audit table is v1. */
export interface AuditEntry {
  event: "ai-gateway";
  purpose: string;
  tier: Tier;
  route: string | null;
  outcome: "ok" | "refused" | "provider-error";
  reasons: string[];
  replaced: Record<string, number>;
}

export function parseRequest(input: unknown): GatewayRequest | { error: string } {
  const purpose = (input as { purpose?: unknown })?.purpose;
  const messages = (input as { messages?: unknown })?.messages;

  if (typeof purpose !== "string" || !purpose) return { error: "purpose is required" };
  if (!Array.isArray(messages) || messages.length === 0) {
    return { error: "messages must be a non-empty array" };
  }
  if (messages.length > GATEWAY_LIMITS.messages) return { error: "Too many messages" };

  let total = 0;
  const parsed: GatewayMessage[] = [];
  for (const raw of messages) {
    const role = (raw as { role?: unknown })?.role;
    const content = (raw as { content?: unknown })?.content;
    if (role !== "system" && role !== "user" && role !== "assistant") {
      return { error: "Invalid message role" };
    }
    if (typeof content !== "string" || !content.trim()) return { error: "Invalid message content" };
    total += content.length;
    if (total > GATEWAY_LIMITS.totalChars) return { error: "Request too long" };
    parsed.push({ role, content });
  }
  return { purpose, messages: parsed };
}

export async function handleGatewayRequest(
  request: GatewayRequest,
  routes: RouteTable,
  fetchFn: typeof fetch,
  audit: (entry: AuditEntry) => void,
): Promise<GatewayResult> {
  // Pseudonymise first so the classifier also sees what the detectors found;
  // keyword markers are matched on the original text.
  const vault = new TokenVault();
  const safeMessages = request.messages.map((message) => ({
    role: message.role,
    content: pseudonymise(message.content, vault),
  }));

  const { tier, reasons } = classify(
    request.purpose,
    request.messages.map((message) => message.content),
    vault.detections,
  );

  const selected = selectRoute(tier, routes);
  const base = { event: "ai-gateway" as const, purpose: request.purpose, tier, reasons, replaced: vault.counts() as Record<string, number> };

  if (!selected) {
    audit({ ...base, route: null, outcome: "refused" });
    return {
      status: 422,
      body: { error: `No model route is approved for data tier ${tier}.`, tier },
    };
  }

  const { route } = selected;
  let response: Response;
  try {
    response = await fetchFn(route.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${route.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: route.model, messages: safeMessages, stream: false }),
    });
  } catch (_error) {
    audit({ ...base, route: route.id, outcome: "provider-error" });
    return { status: 502, body: { error: "Model provider unreachable", tier } };
  }

  if (!response.ok) {
    audit({ ...base, route: route.id, outcome: "provider-error" });
    return { status: 502, body: { error: `Model provider error (${response.status})`, tier } };
  }

  const data = await response.json().catch(() => null) as
    | { choices?: { message?: { content?: unknown } }[] }
    | null;
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    audit({ ...base, route: route.id, outcome: "provider-error" });
    return { status: 502, body: { error: "Unexpected model provider response", tier } };
  }

  audit({ ...base, route: route.id, outcome: "ok" });
  return { status: 200, body: { tier, route: route.id, content: vault.restore(content) } };
}
