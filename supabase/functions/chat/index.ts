import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
const encoder = new TextEncoder();

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

  if (action === "delete-conversation") {
    const conversationId = assertSessionId(payload.conversationId);
    const { error } = await supabaseAdmin
      .from("chat_conversations")
      .delete()
      .eq("id", conversationId)
      .eq("session_id", sessionId);

    if (error) throw error;
    return { ok: true };
  }

  throw new Error("Unsupported action");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { messages, language = "en", action } = body;

    if (action) {
      const data = await handleHistoryAction(action, body);
      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = systemPrompts[language as keyof typeof systemPrompts] || systemPrompts.en;
    console.log("Processing chat request with", messages.length, "messages, language:", language);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.error("AI gateway error:", status, text);

      if (status === 429) {
        return new Response(
          JSON.stringify({ error: language === "de" ? "Rate-Limit überschritten. Bitte versuchen Sie es später erneut." : "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: language === "de" ? "KI-Credits aufgebraucht. Bitte fügen Sie Credits hinzu, um fortzufahren." : "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: language === "de" ? "KI-Service-Fehler" : "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
