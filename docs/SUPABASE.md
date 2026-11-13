# Supabase: deployment, secrets, and the project cutover

## How the backend deploys

Every push to `main` that touches `supabase/**` runs
`.github/workflows/supabase.yml`, which deploys the edge functions and then
pushes migrations.

Why it exists: before this workflow, only the frontend deployed automatically
(Cloudflare Pages). Backend changes were merged and then deployed by hand, or —
as happened with `subscribe-newsletter` — not at all. That function sat in
`main` for six weeks while production returned 404 and every newsletter signup
failed. Nothing warns you about this: the site builds, CI is green, and only a
visitor filling in the form finds out.

**Order matters.** Functions deploy before migrations, deliberately. The
hardening migration drops the public INSERT policies on the lead tables, so the
service-role functions that replace those writes must exist first. Reversing it
breaks both forms for the window in between.

### Required repository secrets

| Secret | Where to get it |
| --- | --- |
| `SUPABASE_ACCESS_TOKEN` | Supabase dashboard → Account → Access Tokens |
| `SUPABASE_DB_PASSWORD` | Project → Settings → Database |
| `SUPABASE_PROJECT_REF` | The project ref, e.g. `abcdefghijklmnop` |

The token must belong to an account with deploy rights on the project. This is
the reason project ownership matters — see the cutover section.

## Edge function secrets

Set these in the Supabase dashboard under Edge Functions → Secrets. They are
**not** repository secrets and never appear in the frontend bundle.

| Secret | Used by | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | `send-contact-email` | Transactional email |
| `RESEND_FROM` | `send-contact-email` | Optional. Defaults to `xeda.ai <contact@xeda.ai>`. The domain must be verified in Resend |
| `CONTACT_NOTIFY_TO` | `send-contact-email` | Optional. Defaults to `contact@xeda.ai` |
| `MAILCHIMP_API_KEY` | `subscribe-newsletter`, `sync-mailchimp`, `unsubscribe-mailchimp` | Server prefix is derived from the key suffix |
| `MAILCHIMP_AUDIENCE_ID` | same | |
| `ELEVENLABS_API_KEY` | `elevenlabs-tts` | Billed per character. Receives only our reply text |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | `chat`, `speech-to-text` | The whole JSON key file of the Google Cloud service account. See "AI provider" below |
| `VERTEX_LOCATION` | same | Optional. Defaults to `eu`. Only EU locations are accepted |
| `CHAT_MODEL`, `CHAT_THINKING_LEVEL` | `chat` | Optional. Default `gemini-3.8-flash`, `LOW`. Re-run `npm run eval:chat` after changing either |
| `STT_MODEL` | `speech-to-text` | Optional. Defaults to `gemini-3.5-flash-lite` |

`SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are injected
by the platform. Do not set them by hand.

### Sending domain

`xeda.ai` is verified in Resend. The sender was previously the shared sandbox
address `onboarding@resend.dev`, which cannot mail arbitrary recipients -- the
visitor confirmation threw, the handler returned 500, and the contact form
reported failure even though the lead was already stored.

If cold outreach ever runs from `xeda.ai` itself, move transactional mail to a
dedicated subdomain (verify `mail.xeda.ai` in Resend, set `RESEND_FROM`) so a
bad outbound run cannot take contact-form confirmations down with it.

## AI provider: Gemini on Vertex AI, inside the EU

The chat assistant and its voice input send visitors' messages and recordings
to Gemini. Those are personal data, so they go through Google Cloud's Vertex AI
on the `eu` multi-region endpoint, where Google states that ML processing stays
within EU member states, and not through the Gemini Developer API (an AI Studio
key), which processes in the USA. The code is `supabase/functions/_shared/gemini.ts`.

It fails closed. Without `GOOGLE_SERVICE_ACCOUNT_JSON` both functions answer
"not configured"; nothing falls back to another endpoint, and a location
outside the EU (`global`, `us-central1`, London, Zurich) is refused.

### One-time setup

1. Create a Google Cloud project with billing, and enable the **Vertex AI API**
   (`aiplatform.googleapis.com`).
2. Create a service account for the website (for example `website-chat`) and
   grant it the **Vertex AI User** role (`roles/aiplatform.user`). Nothing else.
3. Create a JSON key for it. Keep the file outside this repository.
4. Run the go-live check. It makes the same two calls the functions make, with
   the same models, against the same endpoint:
   ```bash
   node scripts/vertex-smoke.mjs path/to/service-account.json
   ```
   Both lines must say PASS. If the `eu` endpoint does not serve a model, the
   output says so; do not switch to `global` to get past it.
5. Turn off Google's prompt cache for the project. By default Vertex AI keeps
   prompts for up to 24 hours to speed up repeated requests. This needs a user
   with `roles/aiplatform.admin`, not the service account:
   ```bash
   curl -X PATCH -H "Authorization: Bearer $(gcloud auth print-access-token)"      -H "Content-Type: application/json"      "https://us-central1-aiplatform.googleapis.com/v1/projects/PROJECT_ID/cacheConfig"      -d '{"name": "projects/PROJECT_ID/cacheConfig", "disableCache": true}'
   ```
   The setting applies to all regions. The go-live check prints its state.
6. In Supabase, set `GOOGLE_SERVICE_ACCOUNT_JSON` to the contents of the key
   file, then deploy.

Source for the residency and retention statements:
https://docs.cloud.google.com/vertex-ai/generative-ai/docs/learn/data-residency and
https://docs.cloud.google.com/vertex-ai/generative-ai/docs/vertex-ai-zero-data-retention

### Secrets that are no longer read

`LOVABLE_API_KEY`, `AI_BASE_URL`, `AI_MODEL` and `AI_REASONING_EFFORT` belong to
earlier providers. The functions ignore them, so a value left in the dashboard
does no harm; delete them when convenient.

### Development

`AI_PROVIDER=gemini-api` with a `GEMINI_API_KEY` sends the same requests to the
Gemini Developer API instead. That is for local testing with test questions
only, never for the deployed project. `npm run eval:chat` uses it too, with
`GEMINI_TEST_KEY` from `.env.local`.

## Security model of the public functions

Three layers, in order of how much they actually protect:

1. **Rate limiting** — `public.check_rate_limit()`, backed by the
   `rate_limits` table. Shared across isolates and survives cold starts. This
   replaced per-isolate `new Map()` limiters that reset on every cold start and
   were never a real control. The limiter fails **open**: a database error
   allows the request, because losing a genuine lead to a transient fault is
   worse than letting one extra request through.
2. **Input caps** — see `_shared/validate.ts`. Enforced before any billed
   third-party call, so an oversized payload costs nothing.
3. **CORS allowlist** — `_shared/cors.ts`, restricted to `xeda.ai` and
   `www.xeda.ai`. Worth having, but note that CORS is enforced by *browsers*.
   It stops another site embedding these endpoints; it does nothing against
   `curl`. Never treat it as the control.

`sync-mailchimp` and `unsubscribe-mailchimp` are admin-only: `verify_jwt = true`
in `config.toml` plus an explicit admin-role check via `_shared/auth.ts`.
Normal newsletter signups no longer touch `sync-mailchimp` at all — the sync
runs server-side inside `subscribe-newsletter`.

## Cutting over to a new Supabase project

Run in this order. Every step is idempotent except the DNS-free frontend rebuild
at the end.

1. Create the project in **eu-central-1 (Frankfurt)**. Prospect data stays in
   the EU; anything else contradicts the GDPR positioning on the site.
2. `supabase login && supabase link --project-ref <new-ref>`
3. `supabase db push` — replays all migrations onto the empty project.
4. `supabase functions deploy` — all six functions.
5. Set the edge function secrets listed above.
6. Create the admin user: sign up through `/admin`, then insert the role:
   ```sql
   insert into public.user_roles (user_id, role)
   values ('<auth user uuid>', 'admin');
   ```
7. Update `.env.production`, `.env.example`, and `supabase/config.toml`
   (`project_id`) with the new ref, URL and anon key.
8. Update the Cloudflare Pages environment variables to match.
9. Add the three repository secrets so the deploy workflow works.
10. Push to `main`. Pages rebuilds the frontend; the Supabase workflow deploys
    the backend.

### Verify after cutover

- Newsletter signup from the footer **and** from a blog post; row appears in
  `newsletter_subscribers`.
- Contact form submits; lead appears in `/admin`; both emails arrive.
- Chatbot replies and TTS plays.
- Anonymous write is refused:
  ```bash
  curl -i -X POST "https://<ref>.supabase.co/rest/v1/contacts" \
    -H "apikey: <anon key>" -H "Content-Type: application/json" \
    -d '{"name":"x","email":"x@y.co","message":"x"}'
  # expect 401/403, not 201
  ```
- Policy state is what you expect:
  ```sql
  select tablename, policyname, cmd from pg_policies
  where schemaname = 'public' order by tablename;
  ```

### Do not forget the old project

If leads were left behind in the previous project, you remain the controller of
personal data you cannot administer — you could not honour an access or deletion
request against it. Have the old project **deleted** rather than left running.
