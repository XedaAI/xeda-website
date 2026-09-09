import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { clientIp, handlePreflight, jsonResponse } from "../_shared/cors.ts";
import { subscribeToMailchimp } from "../_shared/mailchimp.ts";
import { isRateLimited } from "../_shared/rate-limit.ts";
import { getAdminClient } from "../_shared/supabase.ts";
import { isValidEmail } from "../_shared/validate.ts";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60; // 1 hour

interface SubscribeRequest {
  email?: string;
  _hp?: string; // Honeypot field
}

const handler = async (req: Request): Promise<Response> => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  try {
    const admin = getAdminClient();

    if (
      await isRateLimited(admin, {
        bucket: "newsletter",
        identifier: clientIp(req),
        max: RATE_LIMIT_MAX,
        windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
      })
    ) {
      console.log("Rate limit exceeded for IP:", clientIp(req));
      return jsonResponse(req, { error: "Too many requests. Please try again later." }, 429);
    }

    const { email, _hp }: SubscribeRequest = await req.json();

    // Honeypot: bots fill hidden fields. Silently succeed without persisting.
    if (_hp) {
      console.log("Honeypot triggered, likely bot subscription");
      return jsonResponse(req, { success: true, alreadySubscribed: false }, 200);
    }

    const normalizedEmail = (email ?? "").toLowerCase().trim();
    if (!isValidEmail(normalizedEmail)) {
      return jsonResponse(req, { error: "Invalid email format" }, 400);
    }

    if (!admin) {
      return jsonResponse(req, { error: "Server not configured" }, 500);
    }

    const { error: dbError } = await admin
      .from("newsletter_subscribers")
      .insert({ email: normalizedEmail });

    let alreadySubscribed = false;

    if (dbError) {
      // 23505 = unique_violation -> already on the list. Treat as a soft success.
      if (dbError.code === "23505") {
        alreadySubscribed = true;
      } else {
        console.error("Failed to persist newsletter subscriber:", dbError.message);
        return jsonResponse(req, { error: "Failed to subscribe" }, 500);
      }
    }

    // Mailchimp sync runs here, server to server. It used to be a second
    // invoke from the browser, which left the sync endpoint open to anyone.
    // Failure must not fail the signup -- the address is already stored, so we
    // log and move on rather than telling the visitor it did not work.
    if (!alreadySubscribed) {
      try {
        const result = await subscribeToMailchimp(normalizedEmail);
        if (!result.ok) {
          console.error("Mailchimp sync failed (subscriber still saved):", result.error);
        }
      } catch (syncError) {
        console.error("Mailchimp sync threw (subscriber still saved):", syncError);
      }
    }

    return jsonResponse(req, { success: true, alreadySubscribed }, 200);
  } catch (error) {
    console.error("Error in subscribe-newsletter function:", error);
    return jsonResponse(req, { error: "Failed to subscribe" }, 500);
  }
};

serve(handler);
