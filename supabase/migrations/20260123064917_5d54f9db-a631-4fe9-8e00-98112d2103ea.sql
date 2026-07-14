-- Fix overly permissive RLS policies for chat tables
-- This migration restricts chat data access to session-based filtering

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can view their own conversations by session" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can update their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can view messages" ON public.chat_messages;

-- Create proper session-based policies for chat_conversations
-- Users can only view conversations that belong to their session_id
CREATE POLICY "Users can view own session conversations"
ON public.chat_conversations FOR SELECT
USING (
  session_id = COALESCE(
    current_setting('request.headers', true)::json->>'x-session-id',
    ''
  )
);

-- Users can only update their own session's conversations
CREATE POLICY "Users can update own session conversations"
ON public.chat_conversations FOR UPDATE
USING (
  session_id = COALESCE(
    current_setting('request.headers', true)::json->>'x-session-id',
    ''
  )
);

-- Create proper session-based policy for chat_messages
-- Users can only view messages from conversations that belong to their session
CREATE POLICY "Users can view own session messages"
ON public.chat_messages FOR SELECT
USING (
  conversation_id IN (
    SELECT id FROM public.chat_conversations
    WHERE session_id = COALESCE(
      current_setting('request.headers', true)::json->>'x-session-id',
      ''
    )
  )
);

-- Also fix the INSERT policy for chat_messages to validate conversation ownership
DROP POLICY IF EXISTS "Anyone can create messages" ON public.chat_messages;

CREATE POLICY "Users can create messages in own conversations"
ON public.chat_messages FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT id FROM public.chat_conversations
    WHERE session_id = COALESCE(
      current_setting('request.headers', true)::json->>'x-session-id',
      ''
    )
  )
);