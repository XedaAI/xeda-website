/**
 * Rule-based data-tier classifier for the Trust Layer gateway. No model call:
 * the classifier must not itself send data anywhere.
 *
 * Three inputs decide the tier, and the strictest one wins:
 *   1. the purpose the caller declares (its baseline),
 *   2. identifiers found by the pseudonymiser (IBAN -> T2, KVNR -> T3, ...),
 *   3. keyword markers for confidential and secret content.
 *
 * When unsure, the classifier errs towards the stricter tier: an unknown
 * purpose is T3, which with no approved T3 route means the request is refused.
 */
import type { Detection } from "./pseudonymise.ts";
import { strictest, type Tier } from "./tiers.ts";

/**
 * Baseline tier per declared purpose. Free text typed by people is at least T1,
 * because v0 cannot detect names (see pseudonymise.ts).
 */
export const PURPOSE_BASELINE: Readonly<Record<string, Tier>> = {
  "public-content": "T0",
  "website-chat": "T1",
  "voice-receptionist": "T1",
  "tax-documents": "T3",
};

interface Marker {
  tier: Tier;
  reason: string;
  pattern: RegExp;
}

// Word stems, matched at the start of a word in German and English. The `u`
// flag plus \p{L} makes umlauts count as letters.
const MARKERS: readonly Marker[] = [
  {
    tier: "T3",
    reason: "marker:health",
    pattern:
      /(?<!\p{L})(diagnos|befund|rezept|patient|krankenkasse|krankenversicher|arztbrief|krankheit|medikament|therapie|prescription|medical record)/iu,
  },
  {
    tier: "T3",
    reason: "marker:professional-secret",
    pattern: /(?<!\p{L})(mandant|mandatsgeheimnis|berufsgeheimnis|schweigepflicht)|§\s*203/iu,
  },
  {
    tier: "T2",
    reason: "marker:financial-or-contract",
    pattern:
      /(?<!\p{L})(rechnung|invoice|kontoauszug|bank statement|gehalt|lohnabrechnung|payroll|vertrag|contract|bilanz|steuererkl[äa]rung|tax return)/iu,
  },
];

export interface Classification {
  tier: Tier;
  /** Why the tier was chosen. Contains no message content, so it is safe to log. */
  reasons: string[];
}

export function classify(
  purpose: string,
  texts: readonly string[],
  detections: readonly Detection[],
): Classification {
  const reasons: string[] = [];
  const tiers: Tier[] = [];

  const baseline = PURPOSE_BASELINE[purpose];
  if (baseline) {
    tiers.push(baseline);
    reasons.push(`purpose:${purpose}=${baseline}`);
  } else {
    tiers.push("T3");
    reasons.push("purpose:unknown=T3");
  }

  for (const detection of detections) {
    tiers.push(detection.tier);
    const reason = `detected:${detection.kind}`;
    if (!reasons.includes(reason)) reasons.push(reason);
  }

  for (const marker of MARKERS) {
    if (texts.some((text) => marker.pattern.test(text))) {
      tiers.push(marker.tier);
      reasons.push(marker.reason);
    }
  }

  return { tier: strictest(tiers), reasons };
}
