# Daily Log

> Append-only. Newest entry on top. Use the template at the bottom of this file.

---

## 2026-05-20 — Longevity essay first build

**Goal:** Build the full 10-chapter Longevity scrollytelling essay from the structure doc.

**What got done**
- Created `src/lib/explainers/longevity/sources.ts` — 13 sources including OLP 2026, Landmark Twins Study, UK Biobank, Scott & Ellison $37T paper, Buettner Blue Zones, ONS HLE, WHO GBD, Walker, Muir Gray.
- Created `src/lib/explainers/longevity/terms.ts` — 9 inline term definitions: healthspan, exposome, fitness-gap, smeds, blue-zones, hallmarks-of-ageing, telomeres, epigenetics, mismatch-disease.
- Created `src/lib/explainers/longevity/image-manifest.ts` — empty stub (images to be added separately).
- Created `src/lib/explainers/longevity/chapters.ts` — all 10 chapters with 4–5 steps each, mixing narrative, stat reveals, quotes, and viz:
  - Ch1 (red): The 80% Claim — donut (80/20 split), stat, quotes from Ball and critics
  - Ch2 (amber): Three Eras of Medicine — donut (75/25 genetics), stat (500k Biobank), Noble quote
  - Ch3 (ink): The Six Diseases — obs-bar (UK causes of death), mismatch-disease framing
  - Ch4 (forest): The Fitness Gap — obs-timeline (best-possible vs UK average, age 30–100), 19-year stat
  - Ch5 (amber): S-MEDs Framework — sleep stat, Kenny quote, exercise PNAS stat, mindset/diet/stress narrative
  - Ch6 (forest): Blue Zones — obs-bar (centenarians per 100k), honest caveats on record-keeping
  - Ch7 (ink): What Critics Get Right — obs-bar (HLE by deprivation decile, 18.5-year gap), Krieger quote
  - Ch8 (pink): Women's Health Gap — grouped obs-bar (life vs healthy life by sex), 80% centenarians stat, WHI context, Kenny quote
  - Ch9 (amber): Economics — $37T stat, obs-timeline (NHS spend vs HLE divergence), policy ask
  - Ch10 (forest): Monday — Ball's routine narrative, obs-bar (evidence grades for top interventions)
- Created `src/lib/explainers/longevity/index.ts` — barrel module.
- Upgraded `src/routes/longevity/explainer/+page.svelte` from coming-soon placeholder to full essay page (hero with forest gradient, chapter loop, closing note, EssayFooter).

**Decisions made**
- Used `obs-timeline` with age (30–100) on x-axis for the fitness gap chart — `year` field maps to age values; subtitle clarifies.
- NHS spending vs HLE chart uses two series on the same y-scale (both plateau/rise in different value ranges) — subtitle explains the dual-metric nature.
- Evidence strength chart uses a relative index (0–100) rather than raw effect sizes to make the ranking legible to a general audience.
- No `image` type viz yet — no photography for longevity yet; all viz is data-driven until images are available.

**Open questions logged**
- When will longevity photography be available for the hero and Blue Zones map?
- Should the women's health chapter include a specific HRT prescription rate chart once the data is sourced?

**Next session — start here**
1. `pnpm run build` — confirm prerender succeeds with all 10 chapters.
2. Source photography for `static/explainers/longevity/images/` and run `pnpm build` to generate manifest.
3. Add cross-link card in UPF EssayFooter → longevity.

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
