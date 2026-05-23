# Pixel Poetry

> Evidence-led scrollytelling essays on the things that quietly shape modern life.
> Live at [pixelpoetry.dev](https://pixelpoetry.dev).

A growing library of immersive, chapter-by-chapter web essays. Each essay ("explainer") lives at `/explainers/<slug>` and is backed by peer-reviewed sources, original data visualisations, and progressive, motion-respectful animations.

The platform was ported from the standalone [Ultra-Processed](https://ultra-processed.vercel.app) project and refactored into a multi-essay shell so future stories can be added with a single new route folder and a single new data folder.

## Published / planned

| Slug | Status | One-liner |
|------|--------|-----------|
| `ultra-processed` | Published | The food that isn't food — and what it's doing to us. |
| `longevity` | Planned | What actually moves the needle on a longer, healthier life. |

Canonical list lives in [`src/lib/data/explainers.ts`](src/lib/data/explainers.ts).

## Stack

- **SvelteKit 2** + **Svelte 5** (runes mode)
- **TypeScript** strict
- **Tailwind CSS v4** (CSS-first config in `src/lib/styles/app.css`)
- **GSAP 3 + ScrollTrigger** via Svelte 5 `@attach` factories
- **Observable Plot** + d3 for editorial charts
- **PostHog** — cookie-free analytics
- **Better Auth** — email/password + Google OAuth login
- **Neon Postgres** + **Drizzle ORM** — auth database and future member data
- **`@fontsource/arvo` + `@fontsource/lato`** — self-hosted fonts
- **Vercel** hosting via `@sveltejs/adapter-vercel`

## Quick start

```bash
nvm use            # Node 24 LTS, via .nvmrc
pnpm install
pnpm dev           # http://localhost:5173

pnpm check         # type-check
pnpm build         # build-images + vite build
pnpm preview       # preview production build
```

Copy `.env.example` to `.env` and paste your PostHog project key. Production env vars are set in the Vercel dashboard.

## Auth + database

Pixel Poetry uses Better Auth with email/password and Google OAuth. Auth data lives in Neon Postgres via Drizzle.

### Local env vars

Copy `.env.example` to `.env.local` and fill:

```bash
DATABASE_URL=...            # Neon pooled connection string, host contains -pooler
DATABASE_URL_UNPOOLED=...   # Neon direct connection string, no -pooler; used by migrations
BETTER_AUTH_SECRET=...      # generate with: openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:5173
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Keep the existing PostHog vars as-is. In production, set the same private env vars in Vercel and use:

```bash
BETTER_AUTH_URL=https://pixelpoetry.dev
```

### Neon

The Neon project is `PixelPoetry` (`quiet-unit-67188191`) with three long-lived branches:

| App environment | Git / runtime | Neon branch | Purpose |
|-----------------|---------------|-------------|---------|
| Local dev | `pnpm dev` + `.env.local` | `local` | Local testing without touching deployed data. |
| Staging | Vercel Preview for `origin/staging` | `staging` | Preview deployments and pre-production auth tests. |
| Production | Vercel Production for `origin/main` | `production` | Live `pixelpoetry.dev` users. |

Each environment needs two Neon URLs from the matching branch:

1. Turn connection pooling on and use that value for `DATABASE_URL`.
2. Turn connection pooling off and use that value for `DATABASE_URL_UNPOOLED`.

The pooled URL should contain `-pooler` in the hostname. The unpooled URL should not.

For local development, `.env.local` should point at the `local` Neon branch:

```bash
DATABASE_URL=postgresql://...@ep-autumn-lake-alejsod3-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
DATABASE_URL_UNPOOLED=postgresql://...@ep-autumn-lake-alejsod3.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
BETTER_AUTH_URL=http://localhost:5173
```

Run migrations against the current `.env.local` branch with:

```bash
pnpm db:generate
pnpm db:migrate
```

To list branches and fetch connection strings from the CLI:

```bash
neon branches list --project-id quiet-unit-67188191
neon connection-string local --project-id quiet-unit-67188191 --pooled
neon connection-string local --project-id quiet-unit-67188191
neon connection-string staging --project-id quiet-unit-67188191 --pooled
neon connection-string production --project-id quiet-unit-67188191 --pooled
```

Do not commit real connection strings; keep them in `.env.local` or Vercel.

### Vercel environment variables

Set Vercel env vars from the project dashboard or CLI. Scope them carefully:

| Vercel scope | Git branch | Neon branch | `BETTER_AUTH_URL` |
|--------------|------------|-------------|-------------------|
| Production | `main` | `production` | `https://pixelpoetry.dev` |
| Preview + branch override | `staging` | `staging` | stable staging URL, preferably `https://staging.pixelpoetry.dev` |

Recommended staging setup:

1. Add a stable Vercel Preview domain for the `staging` branch, preferably `staging.pixelpoetry.dev`.
2. Add that domain to Google OAuth authorized origins and redirect URIs.
3. Scope all staging database variables to Preview + `staging`, not all Preview deployments.

CLI examples. Prefer piping Neon URLs into Vercel so database passwords do not land in shell history:

```bash
# Production / main / production Neon branch
neon connection-string production --project-id quiet-unit-67188191 --pooled \
  | vercel env add DATABASE_URL production --sensitive --yes --force
neon connection-string production --project-id quiet-unit-67188191 \
  | vercel env add DATABASE_URL_UNPOOLED production --sensitive --yes --force
vercel env add BETTER_AUTH_SECRET production --sensitive --value "$(openssl rand -base64 32)" --yes --force
vercel env add BETTER_AUTH_URL production --value "https://pixelpoetry.dev" --yes --force
vercel env add GOOGLE_CLIENT_ID production --sensitive --value "..." --yes --force
vercel env add GOOGLE_CLIENT_SECRET production --sensitive --value "..." --yes --force

# Staging / origin/staging / staging Neon branch
neon connection-string staging --project-id quiet-unit-67188191 --pooled \
  | vercel env add DATABASE_URL preview staging --sensitive --yes --force
neon connection-string staging --project-id quiet-unit-67188191 \
  | vercel env add DATABASE_URL_UNPOOLED preview staging --sensitive --yes --force
vercel env add BETTER_AUTH_SECRET preview staging --sensitive --value "$(openssl rand -base64 32)" --yes --force
vercel env add BETTER_AUTH_URL preview staging --value "https://staging.pixelpoetry.dev" --yes --force
vercel env add GOOGLE_CLIENT_ID preview staging --sensitive --value "..." --yes --force
vercel env add GOOGLE_CLIENT_SECRET preview staging --sensitive --value "..." --yes --force
```

If the variable already exists with a broader Preview scope, remove or override it so `staging` does not accidentally point at production:

```bash
vercel env list preview
vercel env remove DATABASE_URL preview
```

### Google OAuth

Create a Google OAuth web client and add these authorized redirect URIs:

```text
http://localhost:5173/api/auth/callback/google
https://staging.pixelpoetry.dev/api/auth/callback/google
https://pixelpoetry.dev/api/auth/callback/google
```

Authorized JavaScript origins:

```text
http://localhost:5173
https://staging.pixelpoetry.dev
https://pixelpoetry.dev
```

Then paste the client ID and secret into `.env.local` and Vercel. A single Google OAuth client can cover local, staging, and production if all origins and redirects above are listed.

### Auth scripts

```bash
pnpm auth:generate  # regenerate Better Auth's Drizzle schema after auth config changes
pnpm db:generate    # create Drizzle migrations
pnpm db:migrate     # apply migrations to Neon
```

## Repo layout

```
src/
  lib/
    analytics/posthog.ts           — cookie-free PostHog wrapper
    attachments/                   — Svelte 5 @attach factories (reveal, scrolly)
    components/                    — shared engine: nav, footer, viz, ui, scrolly, landing
    context/explainer.svelte.ts    — active-explainer Svelte context (the heart of the multi-essay setup)
    data/
      site.ts                      — site-wide brand & defaults
      explainers.ts                — index of every essay shown on the landing page
    explainers/
      ultra-processed/             — ONE FOLDER PER ESSAY (meta, chapters, sources, terms, image-manifest, index barrel)
    styles/app.css                 — Tailwind theme tokens + global CSS
    types/explainer.ts             — shared types: Chapter, Step, Stat, Quote, VizConfig, …
  routes/
    +layout.svelte                 — provides explainer context, renders Nav + Footer + SEO + SourceSheet
    +page.svelte                   — landing page
    about/+page.svelte             — about
    explainers/
      +page.svelte                 — /explainers listing
      ultra-processed/+page.svelte — the essay

static/
  explainers/<slug>/               — per-essay assets (images, processed, animations, sources, share-image)
  favicon-*, site.webmanifest      — site-wide

docs/
  ai/                              — agent-facing operational memory (project-brief, architecture, roadmap, daily-log, decisions, …)
  sources/                         — research inbox (drop files here before triaging into an explainer)
  explainers/
    ultra-processed/{facts,scrollytelling-facts}.md + sources/
    longevity/README.md            — placeholder for the next essay
```

## Add a new explainer

The fastest path is the scaffolding skill (see below). Manually it's:

1. Pick a slug (kebab-case), title, accent, eyebrow, tagline.
2. Create `src/lib/explainers/<slug>/{meta,chapters,sources,terms,image-manifest,index}.ts` (copy `ultra-processed/` as a template).
3. Create `src/routes/explainers/<slug>/+page.svelte` and call `onDestroy(activateExplainer(<slug>))`.
4. Append an entry to [`src/lib/data/explainers.ts`](src/lib/data/explainers.ts).
5. Create `static/explainers/<slug>/{images,sources,animations}/` and drop assets.
6. Create `docs/explainers/<slug>/sources/` and drop research PDFs.
7. Run the skills: `source-extraction` → `story-concept` → `add-chapter` (iterate).
8. Run `node scripts/build-images.mjs` to regenerate the manifest.

## Cursor skills

The `.cursor/skills/` folder contains six skills that automate the most common operations on this codebase:

| Skill | When to use |
|-------|-------------|
| `source-extraction` | Triage PDFs/articles into `facts.md` + `scrollytelling-facts.md`. |
| `story-concept` | Turn facts into a chapter arc, hero claim, viz suggestions. |
| `scaffold-explainer` | Create the route, lib folder, and asset directories for a new essay. |
| `add-chapter` | Append a typed `Chapter` to an existing explainer. |
| `pick-viz` | Pick the right chart component for a piece of data. |
| `build-images` | Process new originals and regenerate the per-explainer manifest. |

Skills auto-load when Cursor matches their description against your prompt.

## Architecture in one paragraph

Each explainer is a self-contained data module under `src/lib/explainers/<slug>/`. The root `+layout.svelte` creates an `ExplainerHolder` via Svelte context. Each explainer's `+page.svelte` calls `activateExplainer(<slug>Data)` on mount and resets the holder on destroy. Shared components (Nav, ProgressBar, viz charts, SourceSheet, ShareMenu, EssayFooter) read the active explainer from context and render accordingly — no static imports, no per-route forks. The result: adding a new essay is one new route folder + one new lib folder + one entry in `explainers.ts`. Detailed write-up in [`docs/ai/architecture.md`](docs/ai/architecture.md).

## Editorial credits

This project is editorial. Every quoted statistic cites a peer-reviewed paper, an international research review, or the published account of an independent investigation. Source PDFs are kept under `docs/explainers/<slug>/sources/` for research only and are not redistributed.

## Licence

Code: MIT (see [`LICENSE`](LICENSE) — to be added).
Editorial content & images: all rights reserved.

## Maintainer

Made by [Marc Duby](https://duby.io) · [hello@pixelpoetry.dev](mailto:hello@pixelpoetry.dev)
