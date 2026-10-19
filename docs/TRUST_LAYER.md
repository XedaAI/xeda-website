# Trust Layer v0 (`ai-gateway`)

Jira: BS-75. Background: BS-65 research chapter, Architecture page
(https://xeda.atlassian.net/wiki/spaces/X/pages/88637442).

One server-side gateway that every Xeda product sends AI traffic through. For
each request it:

1. **Classifies** the data into a tier (T0 to T3).
2. **Pseudonymises** direct identifiers, so the model sees `‹IBAN_1›`, not the IBAN.
3. **Routes** the request only to a model approved for that tier, or refuses it.
4. **Restores** the tokens in the model's reply.
5. **Logs** one line with tier, route, reasons and counts, never content.

## Data tiers

| Tier | Covers | Example triggers in v0 |
| --- | --- | --- |
| T0 | Public, no personal data | purpose `public-content` with nothing detected |
| T1 | Ordinary personal data | purpose `website-chat` / `voice-receptionist`, e-mail, phone |
| T2 | Financial and contract data | IBAN, Steuer-ID, "Rechnung", "Vertrag", "Lohnabrechnung" |
| T3 | Professional secrets (§ 203 StGB), Art. 9 health data | KVNR, "Diagnose", "Befund", "Patient", "Mandant", "§ 203", purpose `tax-documents`, any unknown purpose |

The strictest signal wins. An unknown purpose is T3, so new callers must be
added to `PURPOSE_BASELINE` in `_shared/trust/classify.ts` deliberately.

## Routing policy

Each tier's model is configured explicitly as edge function secrets:

| Secret | Meaning |
| --- | --- |
| `TRUST_ROUTE_<TIER>_URL` | OpenAI-compatible chat completions URL |
| `TRUST_ROUTE_<TIER>_MODEL` | Model name |
| `TRUST_ROUTE_<TIER>_KEY` | API key |
| `TRUST_ROUTE_<TIER>_ID` | Optional label for logs |
| `TRUST_GATEWAY_TOKEN` | Shared secret callers send as `x-gateway-token` |

`<TIER>` is `T0`, `T1`, `T2` or `T3`. A tier counts as configured only when URL,
model and key are all set.

- A request may use the route of its own tier or of any **stricter** tier, never
  a weaker one. The least strict adequate route is used.
- No adequate route means **HTTP 422** and no provider call. With nothing
  configured, the gateway refuses everything.
- Nothing falls back to the chat function's `AI_BASE_URL`. That defaults to the
  Gemini Developer API (US), which the research does not allow for personal data.

What the research allows per tier (Architecture page):

| Tier | Allowed route |
| --- | --- |
| T0 | Any approved model, including a US API with a DPA |
| T1 | EU-processed only: an EU-routed hyperscaler (Vertex EU, Bedrock EU, Azure EU) or an EU-owned API, with AVV + SCC and zero retention |
| T2 | EU-headquartered provider or self-hosted; US-parent clouds only after pseudonymisation |
| T3 | Self-hosted in a German data centre or on the client's premises. Health data on C5 Type 2 hosting only |

## Calling it

```http
POST /functions/v1/ai-gateway
x-gateway-token: <TRUST_GATEWAY_TOKEN>
Content-Type: application/json

{ "purpose": "website-chat",
  "messages": [{ "role": "user", "content": "Reach me at max@example.de" }] }
```

Response: `{ "tier": "T1", "route": "<route id>", "content": "<reply, tokens restored>" }`.

`verify_jwt` is off for this function on purpose. The platform JWT check would
accept the public anon key, which ships in the browser bundle, and that would
make the gateway an open model proxy. The function checks its own token
instead, and sends no CORS headers, because browsers must not call it.

## What v0 does not do yet

- **No name or address detection.** That needs a German NER model (Presidio /
  GLiNER), which does not run in an edge function. This is why free text from
  people is never below T1.
- **No persistent token vault.** Tokens live for one request. The vault, which
  also enables erasure by crypto-shredding, is v1.
- **No streaming.** Replies come back whole, so tokens can be restored safely.
- **No audit table.** v0 writes one structured log line per request. The
  hash-chained audit log is v1.
- **No caller is wired up yet.** The website chatbot still calls its provider
  directly. Switching it over is a follow-up after BS-71 and BS-74, which also
  change `functions/chat/index.ts`.
- **No output guard.** Checking replies for leaked identifiers or missing
  citations is v1.

## Tests

```bash
deno test supabase/functions/_shared/trust/
```

The modules have no remote imports, so the tests run offline. CI runs them.
