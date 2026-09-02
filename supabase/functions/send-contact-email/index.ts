import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { clientIp, handlePreflight, jsonResponse } from "../_shared/cors.ts";
import { isRateLimited } from "../_shared/rate-limit.ts";
import { getAdminClient } from "../_shared/supabase.ts";
import { escapeHtml, isValidEmail, LIMITS } from "../_shared/validate.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// Sender and recipient. Both overridable so moving transactional mail to a
// dedicated subdomain (e.g. mail.xeda.ai, to keep cold-outreach reputation away
// from it) is a secret change rather than a deploy.
//
// This was hardcoded to Resend's shared sandbox address, onboarding@resend.dev,
// which cannot send to arbitrary recipients -- so the visitor confirmation threw,
// the handler returned 500, and the form reported failure even though the lead
// had already been saved. xeda.ai is verified in Resend now.
const FROM_ADDRESS = Deno.env.get("RESEND_FROM") ?? "xeda.ai <contact@xeda.ai>";
const NOTIFY_ADDRESS = Deno.env.get("CONTACT_NOTIFY_TO") ?? "contact@xeda.ai";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60; // 1 hour

interface ContactEmailRequest {
  name?: string;
  email?: string;
  company?: string;
  message?: string;
  _hp?: string; // Honeypot field
}

async function sendEmail(
  to: string[],
  subject: string,
  html: string,
  replyTo?: string,
) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return response.json();
}

const handler = async (req: Request): Promise<Response> => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  try {
    const admin = getAdminClient();

    if (
      await isRateLimited(admin, {
        bucket: "contact",
        identifier: clientIp(req),
        max: RATE_LIMIT_MAX,
        windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
      })
    ) {
      console.log("Rate limit exceeded for IP:", clientIp(req));
      return jsonResponse(req, { error: "Too many requests. Please try again later." }, 429);
    }

    const { name, email, company, message, _hp }: ContactEmailRequest = await req.json();

    // Honeypot: bots fill hidden fields. Silently succeed without persisting.
    if (_hp) {
      console.log("Honeypot triggered, likely bot submission");
      return jsonResponse(req, { success: true }, 200);
    }

    if (!name || !email || !message) {
      return jsonResponse(req, { error: "Missing required fields" }, 400);
    }

    if (!isValidEmail(email)) {
      return jsonResponse(req, { error: "Invalid email format" }, 400);
    }

    if (
      name.length > LIMITS.name ||
      message.length > LIMITS.message ||
      (company?.length ?? 0) > LIMITS.company
    ) {
      return jsonResponse(req, { error: "Input too long" }, 400);
    }

    // Persist the lead (best-effort). The service role bypasses RLS.
    if (admin) {
      const { error: dbError } = await admin.from("contacts").insert({
        name,
        email,
        company: company || null,
        message,
      });
      if (dbError) {
        console.error("Failed to persist contact submission:", dbError.message);
      }
    }

    console.log("Sending contact notification email for:", {
      name,
      email: email.substring(0, 3) + "***",
      company,
    });

    // Everything interpolated below is escaped: submitted text must never be
    // able to inject markup or links into the mail we send ourselves.
    // reply_to is the submitter, so replying to the notification answers the
    // lead directly instead of mailing ourselves.
    const adminEmailResponse = await sendEmail(
      [NOTIFY_ADDRESS],
      `New Contact Form Submission from ${name.slice(0, 80)}`,
      `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Company:</strong> ${company ? escapeHtml(company) : "Not provided"}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      `,
      email,
    );

    console.log("Admin notification sent:", adminEmailResponse);

    await sendEmail(
      [email],
      "We received your message!",
      `
        <h2>Thank you for contacting us, ${escapeHtml(name)}!</h2>
        <p>We have received your message and will get back to you within one business day.</p>
        <p>Best regards,<br>The xeda.ai Team</p>
      `,
    );

    console.log("User confirmation sent");

    return jsonResponse(req, { success: true }, 200);
  } catch (error) {
    console.error("Error in send-contact-email function:", error);
    return jsonResponse(req, { error: "Failed to send message" }, 500);
  }
};

serve(handler);
