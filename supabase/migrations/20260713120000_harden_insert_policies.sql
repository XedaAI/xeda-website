-- Harden write access to lead tables.
--
-- Previously anon visitors could INSERT directly via the public anon key
-- (policies "Anyone can submit contact form" / "Anyone can subscribe to newsletter"
-- with WITH CHECK (true)). The client-side honeypot + rate limiting only guarded
-- the email/Mailchimp edge functions, NOT the table writes — so a bot could hit the
-- REST endpoint directly and flood these tables.
--
-- Inserts now flow exclusively through edge functions (send-contact-email,
-- subscribe-newsletter) using the service role, which enforce validation,
-- honeypot, and rate limiting. The service role bypasses RLS, so removing the
-- public INSERT policies blocks direct anon writes without breaking the forms.

DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contacts;
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;

-- RLS stays enabled. With no INSERT policy for anon/authenticated, direct client
-- inserts are denied; SELECT remains admin-only (unchanged from earlier migrations).
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
