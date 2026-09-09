/**
 * Mailchimp audience subscription, shared by subscribe-newsletter (server-side,
 * on every signup) and the admin-only sync-mailchimp function (manual backfill).
 *
 * This used to be invoked directly from the browser, which meant anyone could
 * push arbitrary addresses into the audience. It is server-side only now.
 */

export type MailchimpResult =
  | { ok: true; alreadySubscribed: boolean; id?: string }
  | { ok: false; error: string; status: number };

export async function subscribeToMailchimp(email: string): Promise<MailchimpResult> {
  const apiKey = Deno.env.get("MAILCHIMP_API_KEY");
  const audienceId = Deno.env.get("MAILCHIMP_AUDIENCE_ID");

  if (!apiKey || !audienceId) {
    console.error("Missing Mailchimp configuration");
    return { ok: false, error: "Mailchimp not configured", status: 500 };
  }

  // Server prefix is the suffix of the API key, e.g. "us1" from "xxx-us1".
  const serverPrefix = apiKey.split("-").pop();
  if (!serverPrefix) {
    console.error("Invalid Mailchimp API key format");
    return { ok: false, error: "Invalid API key format", status: 500 };
  }

  const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`anystring:${apiKey}`)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email_address: email, status: "subscribed" }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (data?.title === "Member Exists") {
      return { ok: true, alreadySubscribed: true };
    }
    console.error("Mailchimp API error:", data);
    return {
      ok: false,
      error: data?.detail ?? "Failed to sync to Mailchimp",
      status: response.status,
    };
  }

  return { ok: true, alreadySubscribed: false, id: data?.id };
}
