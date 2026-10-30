/**
 * ElevenLabs endpoint for text-to-speech, so moving it to the EU is one secret,
 * not a code change. (Speech-to-text is Gemini's, see speech-to-text/index.ts.)
 *
 * Default is the global host. For EU data residency set
 *   ELEVENLABS_BASE_URL=https://api.eu.residency.elevenlabs.io
 * which needs an EU-residency ElevenLabs workspace and that workspace's key in
 * ELEVENLABS_API_KEY -- a global key will not authenticate there.
 */
const DEFAULT_BASE_URL = "https://api.elevenlabs.io";

export function elevenLabsUrl(path: string): string {
  const base = (Deno.env.get("ELEVENLABS_BASE_URL") || DEFAULT_BASE_URL).replace(/\/+$/, "");
  return `${base}${path}`;
}
