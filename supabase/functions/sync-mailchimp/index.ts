import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { requireAdmin } from "../_shared/auth.ts";
import { handlePreflight, jsonResponse } from "../_shared/cors.ts";
import { subscribeToMailchimp } from "../_shared/mailchimp.ts";
import { isValidEmail } from "../_shared/validate.ts";

/**
 * Admin-only Mailchimp backfill.
 *
 * This function used to accept an unauthenticated POST from any origin and push
 * the address straight into the audience -- anyone could inject arbitrary
 * emails, poisoning the list and damaging sending reputation. Normal signups no
 * longer touch it at all; subscribe-newsletter syncs server-side. It is kept
 * only so an admin can re-sync an address by hand from /admin.
 */

interface SyncRequest {
  email?: string;
}

const handler = async (req: Request): Promise<Response> => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) {
      return jsonResponse(req, { error: auth.error }, auth.status);
    }

    const { email }: SyncRequest = await req.json();
    const normalizedEmail = (email ?? "").toLowerCase().trim();

    if (!isValidEmail(normalizedEmail)) {
      return jsonResponse(req, { error: "Valid email is required" }, 400);
    }

    console.log(`Admin ${auth.userId} syncing subscriber to Mailchimp`);

    const result = await subscribeToMailchimp(normalizedEmail);

    if (!result.ok) {
      return jsonResponse(req, { error: result.error }, result.status);
    }

    return jsonResponse(
      req,
      result.alreadySubscribed
        ? { success: true, message: "Already subscribed" }
        : { success: true, id: result.id },
      200,
    );
  } catch (error) {
    console.error("Error in sync-mailchimp function:", error);
    return jsonResponse(req, { error: "Failed to sync to Mailchimp" }, 500);
  }
};

serve(handler);
