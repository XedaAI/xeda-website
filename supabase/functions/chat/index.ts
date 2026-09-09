import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.114.0";
import { clientIp, handlePreflight, jsonResponse, corsHeaders } from "../_shared/cors.ts";
import { isRateLimited } from "../_shared/rate-limit.ts";
import { LIMITS } from "../_shared/validate.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
const encoder = new TextEncoder();

// Provider config. Defaults to Gemini's OpenAI-compatible endpoint, which
// speaks the same request shape and the same SSE chunk format the Lovable AI
// gateway did -- so the frontend stream parser is unchanged. Both values are
// env-overridable so a future provider swap needs no code change.
// https://ai.google.dev/gemini-api/docs/openai
const AI_BASE_URL = Deno.env.get("AI_BASE_URL") ??
  "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const AI_MODEL = Deno.env.get("AI_MODEL") ?? "gemini-2.5-flash";
const AI_API_KEY = Deno.env.get("GEMINI_API_KEY");

// The AI path costs money per call, so it gets a tighter budget than the
// history actions, which only touch our own database.
const AI_RATE_LIMIT_MAX = 30;
const AI_RATE_LIMIT_WINDOW_SECONDS = 60 * 60;
const HISTORY_RATE_LIMIT_MAX = 240;
const HISTORY_RATE_LIMIT_WINDOW_SECONDS = 60 * 60;

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");

const signSessionId = async (sessionId: string) => {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(serviceRoleKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(sessionId));
  return toBase64Url(new Uint8Array(signature));
};

const isValidSessionId = (value: unknown): value is string =>
  typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const assertSessionId = (sessionId: unknown) => {
  if (!isValidSessionId(sessionId)) {
    throw new Error("Invalid session");
  }
  return sessionId;
};

const assertSignedSession = async (payload: Record<string, unknown>) => {
  const sessionId = assertSessionId(payload.sessionId);
  const sessionToken = payload.sessionToken;

  if (typeof sessionToken !== "string" || sessionToken !== await signSessionId(sessionId)) {
    throw new Error("Invalid session");
  }

  return sessionId;
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Validate the caller-supplied conversation before we forward it to a billed
 * provider. Previously the array was passed through untouched, which let a
 * caller send unlimited turns and inject their own system role -- i.e. use our
 * key as a general-purpose LLM.
 */
function validateMessages(input: unknown): ChatMessage[] | { error: string } {
  if (!Array.isArray(input) || input.length === 0) {
    return { error: "messages must be a non-empty array" };
  }
  if (input.length > LIMITS.chatMessages) {
    return { error: "Conversation too long" };
  }

  let totalChars = 0;
  const messages: ChatMessage[] = [];

  for (const raw of input) {
    const role = (raw as { role?: unknown })?.role;
    const content = (raw as { content?: unknown })?.content;

    // Only user and assistant turns. The system prompt is ours to set.
    if (role !== "user" && role !== "assistant") {
      return { error: "Invalid message role" };
    }
    if (typeof content !== "string" || !content.trim()) {
      return { error: "Invalid message content" };
    }

    totalChars += content.length;
    if (totalChars > LIMITS.chatTotalChars) {
      return { error: "Conversation too long" };
    }

    messages.push({ role, content });
  }

  return messages;
}

const systemPrompts: Record<string, string> = {
  en: "You are a helpful AI assistant for xeda.ai, a German GenAI agency. You help answer questions about AI, automation, and digital transformation. Be professional, concise, and helpful. If asked about services, mention that xeda.ai offers GenAI SaaS products, AI MVPs, AI automation, AI transformation, and copilots for businesses. Respond in English.",
  de: "Du bist ein hilfreicher KI-Assistent für xeda.ai, eine deutsche GenAI-Agentur. Du hilfst bei Fragen zu KI, Automatisierung und digitaler Transformation. Sei professionell, prägnant und hilfreich. Wenn nach Dienstleistungen gefragt wird, erwähne, dass xeda.ai GenAI SaaS-Produkte, KI-MVPs, KI-Automatisierung, KI-Transformation und Copiloten für Unternehmen anbietet. Antworte auf Deutsch.",
  fr: "Tu es un assistant IA utile pour xeda.ai, une agence allemande de GenAI. Tu aides à répondre aux questions sur l'IA, l'automatisation et la transformation numérique. Sois professionnel, concis et serviable. Si on te demande les services, mentionne que xeda.ai propose des produits SaaS GenAI, des MVPs IA, l'automatisation IA, la transformation IA et des copilotes pour les entreprises. Réponds en français.",
  es: "Eres un asistente de IA útil para xeda.ai, una agencia alemana de GenAI. Ayudas a responder preguntas sobre IA, automatización y transformación digital. Sé profesional, conciso y servicial. Si te preguntan sobre servicios, menciona que xeda.ai ofrece productos SaaS de GenAI, MVPs de IA, automatización de IA, transformación de IA y copilotos para empresas. Responde en español.",
  it: "Sei un assistente IA utile per xeda.ai, un'agenzia tedesca di GenAI. Aiuti a rispondere a domande su IA, automazione e trasformazione digitale. Sii professionale, conciso e disponibile. Se ti chiedono dei servizi, menziona che xeda.ai offre prodotti SaaS GenAI, MVP IA, automazione IA, trasformazione IA e copiloti per le aziende. Rispondi in italiano.",
};

async function handleHistoryAction(action: string, payload: Record<string, unknown>) {
  if (action === "init-session") {
    const sessionId = crypto.randomUUID();
    return { sessionId, sessionToken: await signSessionId(sessionId) };
  }

  const sessionId = await assertSignedSession(payload);

  if (action === "list-conversations") {
    const { data: conversations, error } = await supabaseAdmin
      .from("chat_conversations")
      .select("id, created_at, updated_at, chat_messages(content, role, created_at)")
      .eq("session_id", sessionId)
      .order("updated_at", { ascending: false })
      .order("created_at", { referencedTable: "chat_messages", ascending: true });

    if (error) throw error;

    return (conversations ?? []).map((conversation) => ({
      id: conversation.id,
      created_at: conversation.created_at,
      updated_at: conversation.updated_at,
      preview: conversation.chat_messages?.find((message) => message.role === "user")?.content?.substring(0, 50) ?? "New conversation",
    }));
  }

  if (action === "load-conversation") {
    const conversationId = assertSessionId(payload.conversationId);
    const { data: conversation, error: conversationError } = await supabaseAdmin
      .from("chat_conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("session_id", sessionId)
      .single();

    if (conversationError || !conversation) throw new Error("Conversation not found");

    const { data: messages, error } = await supabaseAdmin
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return messages ?? [];
  }

  if (action === "latest-conversation") {
    const { data, error } = await supabaseAdmin
      .from("chat_conversations")
      .select("id")
      .eq("session_id", sessionId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  if (action === "create-conversation") {
    const { data, error } = await supabaseAdmin
      .from("chat_conversations")
      .insert({ session_id: sessionId })
      .select("id")
      .single();

    if (error) throw error;
    return data;
  }

  if (action === "save-message") {
    const conversationId = assertSessionId(payload.conversationId);
    const message = payload.message as { role?: unknown; content?: unknown } | undefined;
    const role = message?.role;
    const content = message?.content;

    if ((role !== "user" && role !== "assistant") || typeof content !== "string" || !content.trim()) {
      throw new Error("Invalid message");
    }
    if (content.length > LIMITS.chatTotalChars) {
      throw new Error("Message too long");
    }

    const { data: conversation, error: conversationError } = await supabaseAdmin
      .from("chat_conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("session_id", sessionId)
      .single();

    if (conversationError || !conversation) throw new Error("Conversation not found");

    const { error: messageError } = await supabaseAdmin
      .from("chat_messages")
      .insert({ conversation_id: conversationId, role, content });

    if (messageError) throw messageError;

    const { error: updateError } = await supabaseAdmin
      .from("chat_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId)
      .eq("session_id", sessionId);

    if (updateError) throw updateError;
    return { ok: true };
  }

  throw new Error("Unsupported action");
}

serve(async (req) => {
  const preflight = handlePreflight(req);
  if (preflight) return preflight;

  try {
    const body = await req.json();
    const { messages, language = "en", action } = body;
    const ip = clientIp(req);

    if (action) {
      if (
        await isRateLimited(supabaseAdmin, {
          bucket: "chat-history",
          identifier: ip,
          max: HISTORY_RATE_LIMIT_MAX,
          windowSeconds: HISTORY_RATE_LIMIT_WINDOW_SECONDS,
        })
      ) {
        return jsonResponse(req, { error: "Too many requests. Please try again later." }, 429);
      }

      const data = await handleHistoryAction(action, body);
      return jsonResponse(req, { data }, 200);
    }

    if (
      await isRateLimited(supabaseAdmin, {
        bucket: "chat-ai",
        identifier: ip,
        max: AI_RATE_LIMIT_MAX,
        windowSeconds: AI_RATE_LIMIT_WINDOW_SECONDS,
      })
    ) {
      return jsonResponse(
        req,
        {
          error: language === "de"
            ? "Rate-Limit überschritten. Bitte versuchen Sie es später erneut."
            : "Rate limit exceeded. Please try again later.",
        },
        429,
      );
    }

    if (!AI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      return jsonResponse(
        req,
        { error: language === "de" ? "KI-Service-Fehler" : "AI service error" },
        500,
      );
    }

    const validated = validateMessages(messages);
    if ("error" in validated) {
      return jsonResponse(req, { error: validated.error }, 400);
    }

    const systemPrompt = systemPrompts[language as keyof typeof systemPrompts] || systemPrompts.en;
    console.log("Processing chat request with", validated.length, "messages, language:", language);

    const response = await fetch(AI_BASE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...validated,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error("AI provider error:", status, text);

      if (status === 429) {
        return jsonResponse(
          req,
          {
            error: language === "de"
              ? "Rate-Limit überschritten. Bitte versuchen Sie es später erneut."
              : "Rate limit exceeded. Please try again later.",
          },
          429,
        );
      }
      if (status === 402 || status === 403) {
        return jsonResponse(
          req,
          {
            error: language === "de"
              ? "KI-Credits aufgebraucht. Bitte fügen Sie Credits hinzu, um fortzufahren."
              : "AI credits exhausted. Please add credits to continue.",
          },
          status,
        );
      }

      return jsonResponse(
        req,
        { error: language === "de" ? "KI-Service-Fehler" : "AI service error" },
        500,
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders(req), "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return jsonResponse(req, { error: "Chat request failed" }, 500);
  }
});
