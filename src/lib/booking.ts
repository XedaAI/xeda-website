// Cal.com booking links (provided by Saad).
// The "free AI audit" CTA across the site points to the 30-minute call.
// The 60-minute deep-dive is reserved for later use (e.g. a longer strategy call).
export const CAL_AUDIT_30MIN = "https://cal.com/saadbakhtiar/30min";
export const CAL_DEEPDIVE_60MIN = "https://cal.com/saadbakhtiar/60min";

/**
 * Build the free-AI-audit booking URL with UTM attribution.
 * `placement` identifies which CTA was clicked (e.g. "hero", "pricing") so we
 * can see in Cal.com / analytics where bookings originate.
 */
export const auditBookingUrl = (placement: string): string => {
  const params = new URLSearchParams({
    utm_source: "xeda.ai",
    utm_medium: "website",
    utm_campaign: "free-ai-audit",
    utm_content: placement,
  });
  return `${CAL_AUDIT_30MIN}?${params.toString()}`;
};
