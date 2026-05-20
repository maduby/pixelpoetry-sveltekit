# Daily Log

> Append-only. Newest entry on top. Use the template at the bottom of this file.

---

## 2026-05-20 — Pixel Poetry platform port

**Goal:** Port the UPF scrollytelling codebase into a new repo and refactor it into a multi-explainer platform under `pixelpoetry.dev`.

**What got done**
- Mirrored `../upf` into the new workspace (no git history carried over).
- Extracted shared types to `src/lib/types/explainer.ts`; moved per-essay data into `src/lib/explainers/ultra-processed/`.
- Namespaced all static assets under `static/explainers/ultra-processed/`; updated image-manifest paths.
- Built `src/lib/context/explainer.svelte.ts` with `provideExplainerHolder` / `activateExplainer` / `getActiveExplainer` — the active-explainer Svelte context is the new heart of the multi-essay architecture.
- Refactored Nav, ProgressBar, SEO, SourceSheet, ShareMenu, ImageChart, StatCard, QuoteBlock, ObsBarChart, ObsTimelineChart to read from the context.
- Split the old UPF-specific footer into a global `Footer.svelte` (brand + byline) and a per-essay `EssayFooter.svelte` (sources + citations + image credits + chapter nav).
- Built the new landing page (hero + explainer grid + about) and `/explainers` index + `/about` placeholder.
- Moved the UPF essay to `/explainers/ultra-processed/+page.svelte` and wired its context activation.
- Generalised `scripts/build-images.mjs` to walk every explainer's images and emit per-essay manifests.
- Created the Cursor skills under `.cursor/skills/`: source-extraction, story-concept, scaffold-explainer, add-chapter, pick-viz, build-images.
- Restructured docs: per-essay folder under `docs/explainers/<slug>/` with facts + sources; site-wide `docs/sources/` becomes a research inbox.
- Rebranded README, AI knowledge base, and roadmap for Pixel Poetry.
- Initialised git and pushed to `github.com/maduby/pixelpoetry-sveltekit`.

**Decisions made**
- Static per-explainer route directories beat a dynamic `[slug]` route (essays will diverge in hero/closing, and explicit folders make the diff small).
- Cleanup via `onDestroy(activateExplainer(...))` — `getContext` only works during init, so `activateExplainer` captures the holder up front and returns a destroy fn.
- Created a fresh PostHog project for pixelpoetry.dev (separate from UPF analytics) — env vars to fill in locally + Vercel.

**Open questions logged** → see open-questions.md (favicons, share image, longevity content arc).

**Next session — start here**
1. `pnpm install && pnpm check && pnpm build` — confirm zero errors and prerender succeeds.
2. Drop longevity source PDFs into `docs/explainers/longevity/sources/`.
3. Configure the Vercel project + map `pixelpoetry.dev`.

---

## 2026-05-14 — Kick-off & scaffold (UPF original)

**Goal:** Stand up a working SvelteKit scrollytelling skeleton on Vercel-compatible toolchain.

**What got done**
- Decided stack: SvelteKit 2 + Svelte 5 (runes) + TS + Tailwind v4 + GSAP/ScrollTrigger + Lucide + self-hosted Arvo/Lato.
- `.nvmrc` pinned to Node 24 LTS; pnpm upgraded to v11.
- Scaffolded with `sv create` non-interactively (prettier, eslint, tailwind w/ typography + forms, adapter-vercel).
- Installed `gsap`, `lucide-svelte`, `clsx`, `tailwind-merge`, `@fontsource/arvo`, `@fontsource/lato`.
- Built `<Scrolly>` primitive using Svelte 5 `{@attach}` to wire ScrollTrigger.
- Wrote `<StatCard>`, `<QuoteBlock>`, `<Nav>`, `<Footer>`, `<SEO>` components.
- Hardcoded full 10-chapter outline in `src/lib/data/chapters.ts`, plus stats + sources.
- Wired the home page with hero + the first three chapters working as proof-of-concept.
- Wrote out the entire AI workflow under `docs/ai/` (this file, roadmap, architecture, brief, decisions, prompts, glossary, open-questions).

**Decisions made** (full text in `decisions.md`)
- Node 24 over 22 (latest LTS).
- GSAP over `svelte-scrolly` or `@sveltejs/svelte-scroller` (more capable, fully free).
- Self-hosted fonts over Google Fonts CDN (LCP).
- Tailwind v4 with `@theme` CSS-first config (no `tailwind.config.js`).
- Hardcoded data now; CMS later.

**Open questions logged** → see `open-questions.md`.

**Next session — start here**
1. `pnpm run dev` and tour the page.
2. Pick the top item under `🔥 Now` in `roadmap.md` (Chapter 1 build-out).
3. Iterate on visual style — bold colour, big type, gradients — once we know the content shape feels right.

---

## Template (copy when starting a new day)

```
## YYYY-MM-DD — <one-line theme>

**Goal:** <what you intend to ship today>

**What got done**
- …

**Decisions made**
- … → logged in decisions.md

**Open questions logged** → see open-questions.md

**Next session — start here**
1. …
```
