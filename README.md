# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Production is **Cloudflare Pages**, live at [xeda.ai](https://xeda.ai) (and `www.xeda.ai`).
Both hostnames are registered as custom domains on the `xeda-website` Pages project.

Every push to `main` triggers a Pages build automatically:

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Output directory | `dist` |
| `NODE_VERSION` | `20` |

Client config comes from `.env.production` (committed — Supabase public/anon values only).

Two things to be careful of:

- **Never set `GITHUB_PAGES` in the Cloudflare environment.** `vite.config.ts` switches `base`
  to `/xeda-website/` when it is `"true"`, which breaks every asset path on xeda.ai.
- Adding a custom domain in the Pages UI can **rename an existing DNS record** rather than
  create a new one. Check the confirm dialog: `www → www` is a no-op, but `www → @` means it
  is about to move your `www` record onto the apex and leave `www` unresolvable.

`.github/workflows/deploy.yml` still builds for GitHub Pages but is `workflow_dispatch`-only,
kept purely as a manual fallback.

### Backend (Supabase)

Pushes to `main` that touch `supabase/**` deploy the edge functions and
migrations via `.github/workflows/supabase.yml`. Functions deploy before
migrations -- see `docs/SUPABASE.md` for why the order matters, the required
secrets, and the project cutover runbook.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
