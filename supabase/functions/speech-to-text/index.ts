import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { clientIp, handlePreflight, jsonResponse } from "../_shared/cors.ts";
import { elevenLabsUrl } from "../_shared/elevenlabs.ts";
import { isRateLimited } from "../_shared/rate-limit.ts";
import { getAdminClient } from "../_shared/supabase.ts";
import { LIMITS } from "../_shared/validate.ts";

// Voice input for the website chat. Replaces the browser's built-in speech
// recognition, which in Chrome streams the visitor's audio to Google's servers
// -- a processor we neither chose nor name -- and in Firefox does not exist.
// Recording here goes to the same vendor that already speaks our answers.

// ElevenLabs bills STT per minute of audio, so these two constants are the
// spend cap.
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60;

const STT_MODEL = Deno.env.get("ELEVENLABS_STT_MODEL") || "scribe_v2";

// MediaRecorder output per browser, mapped to a file extension the provider
// can use to tell the container apart.
const EXTENSIONS: Record<string, string> = {
  "audio/webm": "webm", // Chrome, Edge, Firefox
  "audio/ogg": "ogg", // older Firefox
  "audio/mp4": "m4a", // Safari
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
};

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  if (req.method !== "POST") {
    return jsonResponse(req, { error: "Method not allowed" }, 405);
  }

  try {
    if (
      await isRateLimited(getAdminClient(), {
        bucket: "stt",
        identifier: clientIp(req),
        max: RATE_LIMIT_MAX,
        windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
      })
    ) {
      return jsonResponse(req, { error: "Too many requests. Please try again later." }, 429);
    }

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    if (!ELEVENLABS_API_KEY) {
      console.error("ELEVENLABS_API_KEY is not configured");
      return jsonResponse(req, { error: "Speech input not configured" }, 500);
    }

    // The body is the raw recording; its type comes from MediaRecorder,
    // e.g. "audio/webm;codecs=opus".
    const mimeType = (req.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    const extension = EXTENSIONS[mimeType];
    if (!extension) {
      return jsonResponse(req, { error: "Unsupported audio type" }, 415);
    }

    // Reject on the declared size before reading anything, then again on what
    // actually arrived -- Content-Length is a claim, not a guarantee.
    if (Number(req.headers.get("content-length") ?? "0") > LIMITS.sttBytes) {
      return jsonResponse(req, { error: "Recording too long" }, 413);
    }
    const audio = await req.arrayBuffer();
    if (audio.byteLength === 0) {
      return jsonResponse(req, { error: "Empty recording" }, 400);
    }
    if (audio.byteLength > LIMITS.sttBytes) {
      return jsonResponse(req, { error: "Recording too long" }, 413);
    }

    const form = new FormData();
    form.append("model_id", STT_MODEL);
    form.append("file", new Blob([audio], { type: mimeType }), `speech.${extension}`);
    // No language_code: it forces a language rather than hinting one, and a
    // visitor on the German page may well ask in English. Auto-detect copes.
    // Event tags would put "(laughter)" into the visitor's message.
    form.append("tag_audio_events", "false");

    // Sizes only. What the visitor said is personal data and stays out of logs.
    console.log(`Transcribing ${audio.byteLength} bytes of ${mimeType}`);

    const response = await fetch(elevenLabsUrl("/v1/speech-to-text"), {
      method: "POST",
      headers: { "xi-api-key": ELEVENLABS_API_KEY },
      body: form,
    });

    if (!response.ok) {
      console.error("ElevenLabs STT error:", response.status, await response.text());
      return jsonResponse(req, { error: "Speech provider error" }, 502);
    }

    const result = await response.json();
    const text = typeof result?.text === "string" ? result.text.trim() : "";

    return jsonResponse(req, { text: text.slice(0, LIMITS.chatTotalChars) });
  } catch (error: unknown) {
    console.error("Error in speech-to-text function:", error);
    return jsonResponse(req, { error: "Failed to transcribe speech" }, 500);
  }
});
