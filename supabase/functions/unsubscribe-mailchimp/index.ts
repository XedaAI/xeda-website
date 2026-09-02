import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { requireAdmin } from "../_shared/auth.ts";
import { handlePreflight, jsonResponse } from "../_shared/cors.ts";
import { getAdminClient } from "../_shared/supabase.ts";
import { isValidEmail } from "../_shared/validate.ts";

interface UnsubscribeRequest {
  subscriberId?: string;
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

    const { subscriberId, email }: UnsubscribeRequest = await req.json();

    if (!subscriberId || !isValidEmail(email)) {
      return jsonResponse(req, { error: "Subscriber ID and a valid email are required" }, 400);
    }

    console.log(`Admin ${auth.userId} unsubscribing a subscriber`);

    // Remove from Mailchimp (best effort -- the database is the source of truth).
    const apiKey = Deno.env.get("MAILCHIMP_API_KEY");
    const audienceId = Deno.env.get("MAILCHIMP_AUDIENCE_ID");

    if (apiKey && audienceId) {
      const serverPrefix = apiKey.split("-").pop();
      const emailHash = await crypto.subtle.digest(
        "MD5",
        new TextEncoder().encode(email.toLowerCase()),
      ).then((buf) =>
        Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("")
      );

      const mailchimpUrl =
        `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${emailHash}`;

      const mcResponse = await fetch(mailchimpUrl, {
        method: "DELETE",
        headers: { Authorization: `Basic ${btoa(`anystring:${apiKey}`)}` },
      });

      if (!mcResponse.ok && mcResponse.status !== 404) {
        console.error("Mailchimp delete failed:", await mcResponse.text());
      } else {
        console.log("Removed from Mailchimp");
      }
    }

    const admin = getAdminClient();
    if (!admin) {
      return jsonResponse(req, { error: "Server not configured" }, 500);
    }

    const { error: deleteError } = await admin
      .from("newsletter_subscribers")
      .delete()
      .eq("id", subscriberId);

    if (deleteError) {
      console.error("Database delete error:", deleteError);
      return jsonResponse(req, { error: "Failed to delete from database" }, 500);
    }

    console.log("Successfully unsubscribed");

    return jsonResponse(req, { success: true }, 200);
  } catch (error) {
    console.error("Error in unsubscribe function:", error);
    return jsonResponse(req, { error: "Failed to unsubscribe" }, 500);
  }
};

serve(handler);
