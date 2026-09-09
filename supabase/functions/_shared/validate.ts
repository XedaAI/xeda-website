/** Shared input validation and escaping helpers. */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LIMITS = {
  email: 255,
  name: 200,
  company: 200,
  message: 5000,
  /** ElevenLabs bills per character, so this is a spend cap as much as a validation. */
  ttsText: 1000,
  chatMessages: 30,
  chatTotalChars: 12000,
} as const;

export function isValidEmail(value: unknown): value is string {
  return typeof value === "string" &&
    value.length > 0 &&
    value.length <= LIMITS.email &&
    EMAIL_RE.test(value);
}

/**
 * Escape user input before it goes into an HTML email body. Without this a
 * submitter can inject markup and links into the notification we send
 * ourselves -- a small but real phishing vector against our own inbox.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
