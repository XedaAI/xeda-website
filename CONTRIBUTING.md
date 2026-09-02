# Contributing to xeda-website

How we work on this repo so multiple people can build in parallel without breaking `main`.

## TL;DR workflow
1. Pull the latest `main`.
2. Create a branch: `git checkout -b feat/short-description`.
3. Commit small, logical changes.
4. Push and open a **Pull Request** into `main`.
5. CI must pass; get **one review**; then **Squash & merge**.
6. Delete the branch.

**Never commit directly to `main`.** All changes go through a PR.

## Prerequisites
- Node.js 20+ and npm.
- Copy `.env.example` → `.env` and fill the values (never commit `.env`).

## Local development
```bash
npm install        # first time
npm run dev        # http://localhost:5173  (or the launch config port)
npm run build      # production build
npm run lint       # eslint
npx tsc --noEmit -p tsconfig.app.json   # typecheck
```
Before opening a PR, make sure **typecheck** and **build** pass locally — they are required in CI.

Edge functions are typechecked separately, because they are Deno and live
outside `tsconfig.app.json`:
```bash
deno check supabase/functions/*/index.ts
```
CI runs this too. Changes under `supabase/**` deploy to production on merge --
see `docs/SUPABASE.md`.

## Branch naming
| Prefix | For | Example |
|---|---|---|
| `feat/` | new feature | `feat/booking-cta` |
| `fix/` | bug fix | `fix/contact-validation` |
| `chore/` | tooling, deps, config | `chore/ci-and-workflow` |
| `docs/` | docs only | `docs/readme` |
| `refactor/` | no behaviour change | `refactor/hero-section` |

## Commit messages
Short imperative summary, optional body explaining *why*. Conventional-commits style is encouraged:
```
feat: add booking CTA to hero
fix: reject invalid emails in newsletter form
chore: add CI pipeline
```

## Pull requests
- One focused change per PR — smaller PRs review faster.
- Fill in the PR template (auto-loaded).
- **CI must be green** (typecheck + build). Lint is currently advisory (see below).
- Requires **1 approving review** before merge.
- Use **Squash & merge** to keep `main` history clean.
- Delete the branch after merge.

## Content changes (i18n)
UI copy lives in `src/contexts/LanguageContext.tsx`. When you add/change visible text, update at least **EN + DE**. Keep keys consistent across languages.

## CI
GitHub Actions (`.github/workflows/ci.yml`) runs on every PR:
- ✅ **Typecheck** (`tsc --noEmit`) — required, must pass.
- ✅ **Build** (`vite build`) — required, must pass.
- ⚠️ **Lint** (`eslint`) — currently **non-blocking**. The inherited template ships with ~20 lint errors; once those are cleaned up (see the tech-debt ticket), we remove `continue-on-error` and make lint a required gate.

## Secrets & security
- Never commit `.env`, API keys, tokens, or the Supabase service-role key.
- Client-safe values (the Supabase anon key, URLs) live in `.env.example`.
- Supabase edge functions read secrets from the runtime environment, not the repo.

## Deployment
Production deploy is set up separately (see Jira BS-4). Merging to `main` does **not** auto-deploy yet — that will be wired once the host is chosen.
