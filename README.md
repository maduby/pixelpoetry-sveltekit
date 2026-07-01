# Pixel Poetry

> Evidence-led scrollytelling essays on the things that quietly shape modern life.
> Live at [pixelpoetry.dev](https://pixelpoetry.dev).

Pixel Poetry is a public-interest editorial platform for immersive, evidence-led web essays. It combines long-form writing, structured source material, data visualisation, responsive interfaces, and motion-respectful scrollytelling in a reusable SvelteKit application.

The project is designed as a maintainable publishing system, not a one-off page. Each essay lives in its own typed data module, with chapters, sources, terms, images, visualisations, metadata, and route wiring kept explicit and repeatable.

## Why this project matters

Pixel Poetry demonstrates the kind of product engineering I enjoy most:

- **Public-interest knowledge work** - explaining complex topics clearly for broad audiences.
- **Reusable content architecture** - one shared application shell for multiple evidence-led essays.
- **Accessible interactive storytelling** - responsive layouts, reduced-motion awareness, readable typography, and progressive enhancement.
- **Data and source discipline** - structured sources, editorial notes, charts, and research material kept close to the content.
- **Modern frontend engineering** - SvelteKit, TypeScript, Tailwind, GSAP, Observable Plot, d3, Vercel, and cookie-free analytics.

For a quick review, start with the live site, then inspect the explainer data model under `src/lib/explainers/` and the site-wide index in `src/lib/data/explainers.ts`.

## Published essays

| Slug | Status | One-liner |
|------|--------|-----------|
| `ultra-processed` | Published | The food that isn't food - and what it's doing to us. |
| `longevity` | Published | What actually moves the needle on a longer, healthier life. |

Canonical list lives in [`src/lib/data/explainers.ts`](src/lib/data/explainers.ts).

## Engineering highlights

- Multi-essay architecture: add a new essay with one route folder, one data folder, and one index entry.
- Typed editorial model for chapters, steps, statistics, quotes, terms, sources, and visualisations.
- Shared explainer context so navigation, progress, source sheets, charts, share UI, and footer read from the active essay.
- Cookie-free PostHog analytics wrapper for privacy-conscious product insight.
- Better Auth, Neon Postgres, and Drizzle support account/member experiments without coupling editorial content to auth state.
- Self-hosted fonts and generated image manifests for predictable rendering and performance.
- Agent-facing project memory and skills under `docs/ai/` and `.cursor/skills/` to keep repeated editorial workflows consistent.

## Stack

- **SvelteKit 2** + **Svelte 5** (runes mode)
- **TypeScript** strict
- **Tailwind CSS v4** (CSS-first config in `src/lib/styles/app.css`)
- **GSAP 3 + ScrollTrigger** via Svelte 5 `@attach` factories
- **Observable Plot** + d3 for editorial charts
- **PostHog** — cookie-free analytics
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

No explicit open-source licence is granted until a `LICENSE` file is added. Editorial content and images are all rights reserved.

## Maintainer

Made by [Marc Duby](https://duby.io) · [hello@pixelpoetry.dev](mailto:hello@pixelpoetry.dev)
