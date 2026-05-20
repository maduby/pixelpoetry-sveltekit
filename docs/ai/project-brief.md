# Project Brief — Pixel Poetry

## One-sentence pitch

A growing library of immersive, evidence-led scrollytelling essays on the things that quietly shape modern life — published under `pixelpoetry.dev`.

## Audience

Readers who love long-form magazine writing but want the visual richness of the web. Journalists, designers, educators, and curious general readers.

## Tone

Direct, evidence-led, occasionally alarming — never preachy. The data does the talking. Visuals are bold (heavy slab headlines, big stat reveals, cinematic colour) without being clickbaity.

## Editorial model

Each essay is a self-contained "explainer" that lives at `/explainers/<slug>`. It owns its own chapter data, sources, terms and image manifest under `src/lib/explainers/<slug>/`. The chrome (nav, progress bar, scrolly engine, viz components, source sheet, footer) is shared and route-aware via the active-explainer Svelte context.

## Published / planned

| Slug | Status | One-liner |
|------|--------|-----------|
| `ultra-processed` | Published | The food that isn't food — and what it's doing to us. |
| `longevity` | Planned | What actually moves the needle on a longer, healthier life. |

See `src/lib/data/explainers.ts` for the canonical list.

## Non-goals

- Not a recipe site, not a diet plan, not personal-advice content.
- Not user-generated. Read-only experience.
- Not a CMS-driven site (yet). Per-essay data is hardcoded TypeScript under `src/lib/explainers/<slug>/` for the first iteration. A CMS migration is plausible once we have ≥3 essays.

## Success criteria

- [x] SvelteKit app boots, deploys to Vercel.
- [x] Mobile + desktop responsive.
- [x] Scrollytelling primitive works (sticky viz + scrolling narrative).
- [x] Branded typography (Arvo + Lato) loads fast (self-hosted via `@fontsource`).
- [x] Adding a new explainer = 1 new route folder + 1 new lib folder (no engine changes).
- [ ] Lighthouse: performance ≥ 90, accessibility ≥ 95 on every page.

## Future, not now

- CMS (Sanity?) for editorial flow
- i18n / paraglide
- Sound design / interactive audio cues
- Per-chapter share cards generated at build time
- A subscribe-to-new-explainers form
