/**
 * Routing policy: which model endpoint may see which data tier.
 *
 * Every tier's route is configured explicitly. Nothing falls back to the chat
 * function's AI_BASE_URL, because that defaults to the Gemini Developer API
 * (US), which the research does not allow for personal data.
 *
 * A request may use the route of its own tier or of any stricter tier: a T1
 * chat can go to the T3 (self-hosted) model, never the other way round. The
 * least strict adequate route is chosen. No adequate route means the request
 * is refused -- the gateway fails closed.
 */
import { rank, type Tier, TIERS } from "./tiers.ts";

export interface Route {
  /** Short label for logs, e.g. "mistral-eu" or "self-hosted". */
  id: string;
  /** OpenAI-compatible chat completions URL. */
  url: string;
  model: string;
  apiKey: string;
}

export type RouteTable = Partial<Record<Tier, Route>>;

/**
 * Read routes from environment variables:
 *   TRUST_ROUTE_T1_URL, TRUST_ROUTE_T1_MODEL, TRUST_ROUTE_T1_KEY, TRUST_ROUTE_T1_ID
 * and the same for T0, T2 and T3. A tier counts as configured only when URL,
 * model and key are all set.
 */
export function routesFromEnv(get: (name: string) => string | undefined): RouteTable {
  const table: RouteTable = {};
  for (const tier of TIERS) {
    const url = get(`TRUST_ROUTE_${tier}_URL`);
    const model = get(`TRUST_ROUTE_${tier}_MODEL`);
    const apiKey = get(`TRUST_ROUTE_${tier}_KEY`);
    if (url && model && apiKey) {
      table[tier] = { id: get(`TRUST_ROUTE_${tier}_ID`) || tier, url, model, apiKey };
    }
  }
  return table;
}

/** The least strict configured route that is allowed for `tier`, or null. */
export function selectRoute(tier: Tier, routes: RouteTable): { tier: Tier; route: Route } | null {
  for (const candidate of TIERS) {
    if (rank(candidate) < rank(tier)) continue;
    const route = routes[candidate];
    if (route) return { tier: candidate, route };
  }
  return null;
}
