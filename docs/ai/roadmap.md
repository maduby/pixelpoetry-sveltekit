# Roadmap

> Single source of truth for "what to work on next". Move items, don't delete. Each section is roughly priority-ordered top to bottom.

---

## 🔥 Now (current sprint)

- [ ] **First Vercel deploy** of pixelpoetry.dev pointed at `maduby/pixelpoetry-sveltekit`. Domain `pixelpoetry.dev` mapped.
- [ ] **New PostHog project** for pixelpoetry.dev. Paste the public key into `.env` locally and into Vercel env vars.
- [ ] **Drop longevity sources** into `docs/explainers/longevity/sources/` and run the `source-extraction` skill.
- [ ] Update `og:image` to a Pixel Poetry-branded share image (`/share-image.jpg` site-wide; per-essay overrides already wired).

## ⏭ Next

- [ ] Add longevity photography to `static/explainers/longevity/images/` and run `pnpm build` to generate the image manifest (hero, Blue Zones map, Sir Christopher Ball).
- [ ] Wire a cross-link card from the UPF `EssayFooter` pointing at the longevity essay (and vice versa).
- [ ] Set `publishedAt` in `src/lib/explainers/longevity/meta.ts` and change status to `'published'` in `src/lib/data/explainers.ts` once the essay is ready to go live.
- [x] **2026-05-20** — Longevity essay built: 10 chapters, all viz wired (donut × 2, obs-bar × 4, obs-timeline × 2, stat cards, quotes). Sources, terms, chapters, index, and +page.svelte complete.
- [ ] Replace placeholder favicons with a Pixel Poetry-branded set (`/static/favicon.*`).
- [ ] Add a per-route `sitemap.xml` and structured-data (Article JSON-LD) helper.
- [ ] Per-explainer share images auto-generated via Vercel OG.
- [ ] Playwright smoke test: landing, /explainers, /explainers/ultra-processed, /about all load and ProgressBar markers render.

## 📦 Backlog

- [ ] Light/dark theme toggle (respect `prefers-color-scheme`).
- [ ] PWA / offline support.
- [ ] Sanity CMS migration once content stabilises (≥3 essays).
- [ ] Storybook / Histoire for shared component dev.
- [ ] i18n via Paraglide.
- [ ] Audio cues (subtle, opt-in) — Howler.js or vanilla Audio API.

## ✅ Done

- [x] **2026-05-20** — Forked the UPF codebase into pixelpoetry-sveltekit and refactored to a multi-explainer platform:
  - Shared types extracted to `$lib/types/explainer.ts`.
  - Per-essay data moved to `$lib/explainers/<slug>/`.
  - Static assets namespaced under `static/explainers/<slug>/`.
  - Active-explainer Svelte context drives Nav, ProgressBar, viz, SourceSheet, ShareMenu, EssayFooter.
  - Landing page + `/explainers` index + `/about` + `/explainers/ultra-processed` routes.
  - `build-images.mjs` generalised to walk every explainer's images.
  - Cursor skills authored: source-extraction, story-concept, scaffold-explainer, add-chapter, pick-viz, build-images.
- [x] **2026-05-16** — (UPF original) Reading-progress bar with chapter markers (`<ProgressBar />`).
- [x] **2026-05-15** — (UPF original) PostHog wired up with cookie-free defaults.
- [x] **2026-05-14** — (UPF original) Repo scaffolded: SvelteKit 2 + Svelte 5 + TS + Tailwind v4 + Vercel adapter.
- [x] **2026-05-14** — (UPF original) `<Scrolly>` primitive (Svelte 5 + GSAP ScrollTrigger via `@attach`).
