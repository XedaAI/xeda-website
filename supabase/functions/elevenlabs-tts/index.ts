import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { clientIp, corsHeaders, handlePreflight, jsonResponse } from "../_shared/cors.ts";
import { isRateLimited } from "../_shared/rate-limit.ts";
import { getAdminClient } from "../_shared/supabase.ts";
import { LIMITS } from "../_shared/validate.ts";

// "Sarah" -- natural and clear.
const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";

// ElevenLabs bills per character, so these two constants are the spend cap.
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_SECONDS = 60 * 60;

/** Voice ids are alphanumeric. Validated because it goes into the request path. */
const VOICE_ID_RE = /^[A-Za-z0-9]{16,32}$/;

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  try {
    const admin = getAdminClient();

    if (
      await isRateLimited(admin, {
        bucket: "tts",
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
      return jsonResponse(req, { error: "TTS not configured" }, 500);
    }

    const { text, voiceId } = await req.json();

    if (typeof text !== "string" || !text.trim()) {
      return jsonResponse(req, { error: "Text is required" }, 400);
    }

    // Reject before spending anything at the provider.
    if (text.length > LIMITS.ttsText) {
      return jsonResponse(
        req,
        { error: `Text too long (max ${LIMITS.ttsText} characters)` },
        400,
      );
    }

    let selectedVoiceId = DEFAULT_VOICE_ID;
    if (voiceId !== undefined && voiceId !== null && voiceId !== "") {
      if (typeof voiceId !== "string" || !VOICE_ID_RE.test(voiceId)) {
        return jsonResponse(req, { error: "Invalid voice id" }, 400);
      }
      selectedVoiceId = voiceId;
    }

    console.log(`Generating speech for ${text.length} characters with voice: ${selectedVoiceId}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          output_format: "mp3_44100_128",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("ElevenLabs API error:", response.status, errorData);
      return jsonResponse(req, { error: "TTS provider error" }, 502);
    }

    const audioBuffer = await response.arrayBuffer();

    // Chunked base64 encode: String.fromCharCode(...bigArray) blows the call
    // stack on longer clips.
    const bytes = new Uint8Array(audioBuffer);
    let binary = "";
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
    }
    const base64Audio = btoa(binary);

    console.log("Speech generated successfully");

    return new Response(JSON.stringify({ audioContent: base64Audio }), {
      headers: { "Content-Type": "application/json", ...corsHeaders(req) },
    });
  } catch (error: unknown) {
    console.error("Error in elevenlabs-tts function:", error);
    return jsonResponse(req, { error: "Failed to generate speech" }, 500);
  }
});
