-- Refine chat table access: remove public direct access and keep admin-only review access.
-- Public chatbot persistence should be handled through backend functions using server-side validation.

-- Remove all known chat_conversations policies, including permissive and previous session-header variants.
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can view their own conversations by session" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can update their own conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can view own session conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can update own session conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can delete conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Admins can view chat conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Admins can delete chat conversations" ON public.chat_conversations;

-- Remove all known chat_messages policies, including permissive and previous session-header variants.
DROP POLICY IF EXISTS "Anyone can create messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can view messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can create messages in own conversations" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view own session messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can update messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can delete messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can view chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can delete chat messages" ON public.chat_messages;

-- Ensure RLS remains enabled.
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Admin-only review access for chat data. Public visitors do not get direct table access.
CREATE POLICY "Admins can view chat conversations"
ON public.chat_conversations
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete chat conversations"
ON public.chat_conversations
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can view chat messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete chat messages"
ON public.chat_messages
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));