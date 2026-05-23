# Daily Log

> Append-only. Newest entry on top. Use the template at the bottom of this file.

---

## 2026-05-23 — Source-grounded saved takeaways

**Started:** 2026-05-23T09:38:48Z / 11:38 SAST

**Goal:** Add a source-grounding layer so saved takeaways and AI recaps can be backed by Pixel Poetry's own explainer evidence base.

**What got done**

- Added source-grounding schema: `source_document`, `source_chunk`, `saved_insight_source_match`, and `insight_summary_source`.
- Added `pgvector` readiness through a nullable `vector(1536)` source chunk column, with embeddings disabled until a compatible provider is configured.
- Added `src/lib/explainers/registry.ts` as the single place future explainers must register for source ingestion.
- Added `pnpm sources:ingest`, which ingested 36 canonical source documents and 191 source chunks locally for Longevity and Ultra-Processed.
- Wired saved takeaways to attach best matching source chunks server-side.
- Updated recap generation to receive `allowedSources` and output optional source citations without inventing references.
- Updated account and email recap views to show source links/support notes when the model uses grounded sources.
- Added `docs/ai/source-grounding.md` and a repo-local Codex skill for future source-grounding work.

**Decisions made**

- Use retrieval as the citation authority. The recap model can cite only source IDs that the server provides.
- Keep embeddings provider-swappable and off by default; lexical/context retrieval keeps the feature stable while MiniMax embedding support remains separate from MiniMax chat support.
- Do not delete stale source chunks during ingestion; ingestion is append/update only so future manually added source records are not accidentally removed.

**Verification**

- `pnpm db:generate`
- `pnpm db:migrate`
- `pnpm sources:ingest`
- Neon disposable staging branch migration, real staging migration, and staging source ingestion
- `pnpm check` passes with the existing `StatCard.svelte` warning only.

**Next session — start here**

1. Test a fresh save + recap in `/account` and confirm source chips appear when retrieved snippets are relevant.
2. Configure embeddings only after choosing a 1536-dimensional OpenAI-compatible embedding endpoint.
3. Before production, repeat this disposable-branch flow from the production branch.

---

## 2026-05-23 — Recap shelf UX

**Goal:** Make multiple AI recaps feel intentional, compact, and manageable.

**What got done**

- Capped saved recap history to the 5 most recent recaps per user after new recap generation.
- Replaced the always-expanded latest recap panel with a compact `My recaps` shelf on the account page.
- Added recap open, email, delete, and edit actions.
- Moved full recap reading into the shared native bottom sheet so it works as a bottom sheet on mobile and a large focused panel on desktop.
- Added a small authenticated PATCH/DELETE API for editing recap title/overview/shareable text and deleting private recaps.

**Verification**

- Pending final `pnpm check` and `pnpm build`.

---

## 2026-05-23 — Saved insights AI layer

**Goal:** Implement the logged-in saved-insights MVP with AI recaps and Resend email-to-self.

**What got done**

- Re-ran migration flow for testing: Drizzle found no new schema changes, local migrations applied successfully, a fresh disposable Neon branch from `staging` applied cleanly, and real Neon `staging` applied cleanly.
- Added recap backlinks: summaries now persist the saved takeaway IDs used for generation, `/account` links to Pixel Poetry, the explainer, and each recapped passage, and recap emails include the same source-piece links.
- Applied the recap-link migration locally, on a disposable Neon branch copied from `staging`, and on the real Neon `staging` branch.
- Added direct MiniMax support via the AI SDK OpenAI-compatible provider (`AI_PROVIDER=minimax`, `MINIMAX_API_KEY`, `MINIMAX_MODEL=MiniMax-M2.7`) while keeping Vercel AI Gateway as an alternative.
- Verified the local MiniMax key against `MiniMax-M2.7` and updated `.env.local` to use the direct MiniMax provider path without exposing the secret.
- Adjusted recap generation for MiniMax reasoning output by requesting `reasoning_split` and validating JSON from the text channel.
- Added AI SDK v6, Zod, and Resend dependencies.
- Kept Vercel AI Gateway available with `AI_GATEWAY_MODEL=minimax/minimax-m2.7`; avoided the young direct MiniMax provider package.
- Added Drizzle tables and migration for saved insights, structured AI summaries, and email deliveries.
- Added authenticated SvelteKit API routes for saving highlights, generating recaps, emailing recaps, and smoke-testing Resend.
- Added a client highlight-to-save layer for explainer prose only.
- Refined the selection UX into a bold `🥡 Takeaway` tooltip button that saves immediately with a packed animation.
- Extended takeaway selection to quote/stat/viz moments as well as prose, while preserving explainer/chapter/step context for AI.
- Made the takeaway tooltip trigger after pointer/mouse release with a short delayed selection read so it appears reliably once marking ends.
- Fixed tooltip positioning to use viewport coordinates for the fixed overlay, so it no longer renders off-screen after scrolling.
- Restyled the takeaway tooltip as a single dark WCAG-AA popover with a same-surface arrow, normal shadow, and no hover movement.
- Dismissed the floating takeaway tooltip on scroll, wheel, touch move, and resize so it never drifts away from the selected text.
- Dismissed the floating takeaway tooltip on outside click/tap while preserving clicks on the tooltip itself.
- Replaced the anchored takeaway tooltip with a fixed bottom action bar that includes selected-text preview, Save/Login action, and dismiss control.
- Refined the takeaway action into a desktop `min(32rem, viewport)` bottom card and mobile mini bottom sheet with a handle, safe-area spacing, Escape dismissal, and Sonner reserved for feedback.
- Simplified the takeaway action so it no longer repeats selected text; it is now a compact save/dismiss control.
- Hardened `SavedInsightLayer` for SSR and selection performance by guarding browser globals, clearing pending timers on teardown, and deduping repeated selection events.
- Changed saved-takeaway API failures for missing AI tables from raw 500s to an intentional migration-pending response with clearer UI copy.
- Applied the saved-takeaways Drizzle migration locally, verified on a disposable Neon branch copied from `staging`, then applied and verified on the real Neon `staging` branch.
- Added account-page takeaway search, select all/clear/select-results controls, per-takeaway recap checkboxes, and selected-ID summary generation.
- Returned a clear AI-unavailable response when recap generation cannot reach/configure the provider, instead of surfacing a generic 500.
- Updated `/account` with saved takeaways, latest recap, email-to-self, and email test controls.
- Added PostHog events that track behavior without sending selected text, notes, summaries, prompts, or email addresses.
- Added a safe Neon migration workflow script for local → disposable staging duplicate → staging → disposable main duplicate → main.
- Updated `/account` so missing AI tables show a migration-pending state instead of a 500.

**Decisions made**

- Saved-insights-first beats generic AI chat for v1 → logged in `decisions.md`.
- Direct MiniMax is the active local provider path; Vercel AI Gateway and OpenRouter stay available alternatives → logged in `decisions.md`.
- Private email-to-self is the first sharing/export path → logged in `decisions.md`.
- Neon production migrations must be verified on a disposable branch copied from the target branch first → logged in `decisions.md`.
- Takeaway recap prompt version is now `saved-takeaways-summary-v1`.

**Open questions logged** → see `open-questions.md`

**Next session — start here**

1. Add `AI_PROVIDER`, `MINIMAX_API_KEY`, `MINIMAX_MODEL`, `RESEND_API_KEY`, and `RESEND_FROM_EMAIL` in Vercel env vars.
2. Log in locally, save a takeaway, generate a recap, and send the Resend smoke email.
3. Before production, repeat the disposable-branch verification flow from `main`, then apply with `ALLOW_PRODUCTION_MIGRATION=true`.

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
