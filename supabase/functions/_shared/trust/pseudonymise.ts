/**
 * Pseudonymisation for the Trust Layer gateway.
 *
 * Direct identifiers are swapped for tokens such as ‹IBAN_1› before a payload
 * leaves our infrastructure, and swapped back in the model's reply. The same
 * value always gets the same token within one request, so the model can still
 * reason about "the same IBAN" across messages.
 *
 * v0 limits, on purpose:
 * - The token map lives in memory for one request only. The persistent token
 *   vault (needed for erasure by crypto-shredding) is v1.
 * - Names and postal addresses are NOT detected. That needs a German NER model
 *   (Presidio / GLiNER in the research), which does not run in an edge function.
 *   Callers must therefore treat free text from people as at least T1 -- see
 *   PURPOSE_BASELINE in classify.ts.
 */
import type { Tier } from "./tiers.ts";

export type IdentifierKind = "IBAN" | "EMAIL" | "KVNR" | "STEUER_ID" | "PHONE";

interface Detector {
  kind: IdentifierKind;
  /** Tier implied by finding this identifier at all. */
  tier: Tier;
  pattern: RegExp;
  /** Optional check that cuts false positives (checksums). */
  isValid?: (match: string) => boolean;
}

/** IBAN check per ISO 13616: move the first four characters to the end, map letters to numbers, mod 97 must be 1. */
export function isValidIban(raw: string): boolean {
  const iban = raw.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let remainder = 0;
  for (const char of rearranged) {
    const value = char >= "A" && char <= "Z" ? String(char.charCodeAt(0) - 55) : char;
    for (const digit of value) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }
  }
  return remainder === 1;
}

/** German Steuer-Identifikationsnummer check digit (ISO 7064, MOD 11,10). */
export function isValidSteuerId(raw: string): boolean {
  if (!/^[1-9]\d{10}$/.test(raw)) return false;
  let product = 10;
  for (let i = 0; i < 10; i++) {
    let sum = (Number(raw[i]) + product) % 10;
    if (sum === 0) sum = 10;
    product = (sum * 2) % 11;
  }
  let check = 11 - product;
  if (check === 10) check = 0;
  return check === Number(raw[10]);
}

function hasPhoneLength(match: string): boolean {
  const digits = match.replace(/\D/g, "").length;
  return digits >= 7 && digits <= 15;
}

// Order matters: identifiers with checksums go first, so a valid IBAN or
// Steuer-ID is never half-eaten by the looser phone pattern.
const DETECTORS: readonly Detector[] = [
  {
    kind: "IBAN",
    tier: "T2",
    // Groups of four, optionally space-separated, as IBANs are usually written.
    pattern: /\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]{4}){2,7}(?: ?[A-Z0-9]{1,4})?\b/g,
    isValid: isValidIban,
  },
  {
    kind: "EMAIL",
    tier: "T1",
    pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
  },
  {
    // Krankenversichertennummer: one letter and nine digits. Health data, so T3.
    kind: "KVNR",
    tier: "T3",
    pattern: /\b[A-Z]\d{9}\b/g,
  },
  {
    kind: "STEUER_ID",
    tier: "T2",
    pattern: /\b[1-9]\d{10}\b/g,
    isValid: isValidSteuerId,
  },
  {
    kind: "PHONE",
    tier: "T1",
    // International (+49 / 0049) or national (leading 0) numbers with the usual
    // separators. Over-matching a nearby number is the safe direction here.
    pattern: /(?<![\w+‹])(?:\+\d{1,3}[\s/-]?|00\d{1,3}[\s/-]?|0)\d[\d\s/-]{5,}\d/g,
    isValid: hasPhoneLength,
  },
];

export interface Detection {
  kind: IdentifierKind;
  tier: Tier;
}

/**
 * Holds the token map for one request. Create one per request and pass it to
 * every message, so identical values share a token across the conversation.
 */
export class TokenVault {
  private readonly byValue = new Map<string, string>();
  private readonly byToken = new Map<string, string>();
  private readonly counters = new Map<IdentifierKind, number>();
  readonly detections: Detection[] = [];

  tokenFor(kind: IdentifierKind, value: string): string {
    const key = `${kind}:${value}`;
    const existing = this.byValue.get(key);
    if (existing) return existing;
    const next = (this.counters.get(kind) ?? 0) + 1;
    this.counters.set(kind, next);
    const token = `‹${kind}_${next}›`;
    this.byValue.set(key, token);
    this.byToken.set(token, value);
    return token;
  }

  /** How many distinct values of each kind were replaced. Safe to log. */
  counts(): Partial<Record<IdentifierKind, number>> {
    return Object.fromEntries(this.counters) as Partial<Record<IdentifierKind, number>>;
  }

  /** Swap tokens back for the original values. Unknown tokens are left alone. */
  restore(text: string): string {
    return text.replace(/‹[A-Z_]+_\d+›/g, (token) => this.byToken.get(token) ?? token);
  }
}

/** Replace every detected identifier in `text` with a token from `vault`. */
export function pseudonymise(text: string, vault: TokenVault): string {
  let result = text;
  for (const detector of DETECTORS) {
    result = result.replace(detector.pattern, (match) => {
      if (detector.isValid && !detector.isValid(match)) return match;
      vault.detections.push({ kind: detector.kind, tier: detector.tier });
      return vault.tokenFor(detector.kind, match);
    });
  }
  return result;
}
