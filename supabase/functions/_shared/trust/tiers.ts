/**
 * Data tiers from the BS-65 research (Architecture chapter).
 *
 *   T0  public              no personal data
 *   T1  personal            ordinary personal data (names, contact data, chats)
 *   T2  confidential        financial and contract data
 *   T3  secret              professional secrets (§ 203 StGB) and Art. 9 data
 *
 * The tier of a request is set by the strictest item in it: one diagnosis in an
 * otherwise harmless message makes the whole request T3.
 */
export type Tier = "T0" | "T1" | "T2" | "T3";

export const TIERS: readonly Tier[] = ["T0", "T1", "T2", "T3"];

export function isTier(value: unknown): value is Tier {
  return typeof value === "string" && (TIERS as readonly string[]).includes(value);
}

export function rank(tier: Tier): number {
  return TIERS.indexOf(tier);
}

/** The stricter of two tiers. */
export function stricter(a: Tier, b: Tier): Tier {
  return rank(a) >= rank(b) ? a : b;
}

/** The strictest tier in a list; T0 for an empty list. */
export function strictest(tiers: Iterable<Tier>): Tier {
  let result: Tier = "T0";
  for (const tier of tiers) result = stricter(result, tier);
  return result;
}
