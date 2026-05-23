# Decisions Log (ADR-lite)

> One entry per meaningful technical or design choice. Format: date • decision • alternatives • why.

---

## 2026-05-23 • Saved insights before AI chat

- **Alternatives:** generic article chatbot; section summaries injected into the essay; full personal knowledge graph first.
- **Why:** Highlight-to-save preserves the editorial scrollytelling experience and makes AI opt-in, private, and useful. The reader chooses what matters, then AI helps them remember and digest those saved passages later.

## 2026-05-23 • Vercel AI Gateway for v1 AI provider

- **Alternatives:** direct MiniMax provider package; OpenRouter; OpenAI/Anthropic direct SDKs.
- **Why:** Vercel AI Gateway keeps the implementation clean with AI SDK model strings and supports MiniMax M2.7 as `minimax/minimax-m2.7`. The direct MiniMax AI SDK provider package is young, so it stays out of v1. OpenRouter remains a future option if pricing, routing, or BYOK requirements change.

## 2026-05-23 • Private email-to-self as first sharing/export path

- **Alternatives:** public share links; unlisted token pages; no sharing in v1.
- **Why:** Email-to-self gives users a useful, durable recap without introducing public permissions, moderation, or accidental disclosure risk. Resend sends only to the authenticated account email in v1.

## 2026-05-23 • Neon migrations must verify on disposable branches first

- **Alternatives:** run Drizzle migrations directly against staging/main; rely on Vercel preview branch automation only; manually clone branches in the Neon console.
- **Why:** Schema changes need a repeatable promotion path. The repo now treats disposable Neon branches as migration rehearsals: local → disposable staging clone → staging → disposable main clone → main. Production migrations require an explicit verified branch, confirmation flag, and `ALLOW_PRODUCTION_MIGRATION=true`.

## 2026-05-20 • Multi-explainer platform via active-explainer Svelte context

- **Alternatives:** (a) module-level reactive state (SSR concurrency hazard); (b) dynamic `[slug]` route + lazy import (forces a single page template, hard to deviate); (c) per-essay Svelte stores (route changes don't reset them).
- **Why:** A class with `$state` provided through `setContext` in `+layout.svelte` and mutated from each `+page.svelte` keeps the Nav, ProgressBar, viz components and SourceSheet route-aware without forcing a single template across essays. SSR-safe because state lives on the component instance, not a module. Adding a new essay is one route folder + one lib folder; no engine changes.

## 2026-05-20 • Static per-explainer route folders (not `[slug]`)

- **Alternatives:** dynamic `[slug]/+page.svelte` reading a registry.
- **Why:** Each essay will diverge in hero, accent, closing note, and occasionally bespoke sections. Static folders make those diffs small and explicit; dynamic routing would force every essay into a single shape.

## 2026-05-20 • Namespace static assets under `static/explainers/<slug>/`

- **Alternatives:** keep everything at the static root.
- **Why:** Avoids filename collisions across essays as the library grows, lets us cache-control per essay later, and makes the diff for "add longevity" obvious — just drop into a new namespaced folder.

## 2026-05-20 • New PostHog project per site, not per essay

- **Alternatives:** reuse the UPF PostHog project; one project per essay.
- **Why:** Cleanest separation of analytics scope. UPF events on the old `ultra-processed.vercel.app` deployment stay isolated; pixelpoetry.dev gets its own dashboard covering the whole library. Per-essay filtering is done with event properties (`explainer`).

## 2026-05-14 • Use Node 24 LTS (not 22)

- **Alternatives:** Node 22 LTS (still in active maintenance), Node 23 (no LTS).
- **Why:** User asked for "latest stable". Node 24 (Krypton) is the active LTS as of Oct 2025 and fully supported by Vercel.

## 2026-05-14 • Use pnpm

- **Alternatives:** npm, yarn, bun.
- **Why:** User asked. Also fastest cold install + content-addressed deduping.

## 2026-05-14 • SvelteKit + Svelte 5 (runes mode forced)

- **Alternatives:** Astro (good for content but less ergonomic for interactive scrollytelling), Next.js (heavier client runtime).
- **Why:** SvelteKit ships the least JS for the same UX, Svelte 5 runes are great for the lots-of-local-state scrollytelling needs, and `@attach` is a clean integration point for GSAP.

## 2026-05-14 • GSAP + ScrollTrigger as primary animation engine

- **Alternatives:** `svelte-scrolly` (LeaVerou) — too narrow. `@sveltejs/svelte-scroller` — older, less feature rich. `motion.dev` for Svelte — promising but smaller ecosystem. Pure IntersectionObserver — fine for fades, can't do pinning + scrubbing without re-inventing GSAP.
- **Why:** GSAP became fully free in 2024 including all plugins. ScrollTrigger is the de-facto industry standard for scroll-scrubbed timelines, snapping, pinning, and progress mapping. Pairs cleanly with Svelte 5 via `{@attach}` — no wrapper library needed.

## 2026-05-14 • Self-hosted fonts via `@fontsource/*`

- **Alternatives:** Google Fonts `<link>`, Fontaine/Fontsource-variable subsets.
- **Why:** Self-hosting eliminates the third-party DNS + handshake before LCP. `@fontsource/arvo` + `@fontsource/lato` import into the bundle, get Vite-hashed for long cache. Lato isn't yet shipped as a variable font on `@fontsource-variable`, so we ship two weights (400, 700) of static; Arvo only ships 400/700/italic (no variable axis available either). For a single chapter scroll-piece the bytes are negligible (<60kb total).

## 2026-05-14 • Tailwind v4 with CSS-first `@theme` config

- **Alternatives:** Tailwind v3 + `tailwind.config.js`.
- **Why:** v4 is markedly faster (Lightning CSS), config lives next to globals which is easier to reason about, and `sv add tailwindcss` defaults to v4.

## 2026-05-14 • Hardcoded data in `src/lib/data/`, no CMS yet

- **Alternatives:** Sanity, Tina, KeystaticJS, plain Markdown.
- **Why:** User explicitly requested. Content is still being shaped; locking it in TS lets us iterate on schema along with the code. We'll migrate to Sanity (probably) once the structure is stable.

## 2026-05-14 • Build a tiny in-house `<Scrolly>` primitive, not depend on `svelte-scrolly`

- **Alternatives:** `svelte-scrolly` npm package.
- **Why:** Two reasons. (1) `svelte-scrolly` was written for Svelte 4 idioms; we want Svelte 5 runes + `@attach`. (2) We need full control over `prefers-reduced-motion`, snapping, and progress-to-state mapping — easier to own ~100 lines than fight an external API. The component is in `src/lib/components/scrolly/`.

## 2026-05-14 • Single home page first, multi-route later

- **Alternatives:** Per-chapter routes from day one.
- **Why:** Scrollytelling pieces work best as one continuous experience. We can split into routes per chapter later for shareability if needed.

## 2026-05-14 • Bold-colour palette anchored to the food-industry critique

- **Decision:** primary red `#dc2626`, accent amber `#f59e0b`, alarm pink `#ec4899`, cream `#fef9ef`, ink `#0a0a0a`.
- **Why:** Aligns with the visceral "warning label" mood of the topic without being literally red-warning-stripe cliché. Cream + ink gives editorial gravitas; amber + pink give punch to stat reveals.
