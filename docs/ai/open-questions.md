# Open Questions

> Move resolved items to `decisions.md`.

## Pixel Poetry platform

- **Favicons & share image.** Pixel Poetry-branded favicon suite + a default `/share-image.jpg` are still to be made. Currently using the UPF assets.
- **The duby.io portfolio.** Where does this live now that pixelpoetry.dev replaces it? Sub-route at `/about`, separate site, or keep at `duby.io`?
- **`/explainers` index vs landing.** They both show the grid. Should the `/explainers` index get a richer filter UI (eyebrow / status filters) as the library grows?

## Longevity explainer

- **Working title.** "Longevity" is the slug; the headline / hero line is open. Candidates: "How long is long?", "The longevity question", "Adding life to years".
- **Source list.** First batch of PDFs / articles / podcast notes goes into `docs/explainers/longevity/sources/`. Need to confirm: peer-review only, or include long-form journalism + Attia / Sinclair-style trade books too?
- **Tone.** Evidence-led vs aspirational. Probably evidence-led, but a single warm voice throughout would help.

## Editorial

- **Voice & person.** Do we write in third-person reportage ("Researchers found…") or pull readers in with second-person ("Look at the cereal in your kitchen.")? Currently mixed — needs a single editor pass.
- **Quote selection.** Van Tulleken has very quotable lines. Should we lean on 5–6 marquee quotes throughout, or use one big quote per chapter? Currently: one per chapter.
- **Source credibility hierarchy.** Are we citing the book primarily, peer-reviewed only, or both equally? Current default: book for argument, peer-reviewed for numbers.

## Design

- **Brand identity.** No real visual identity yet. Current palette (red/amber/pink/cream/ink) is a working hypothesis. Worth a proper moodboard before locking. Consider also: typographic-only treatment (very strong slab headlines, no illustrations) vs. illustrated.
- **Dark mode as the default?** UPF-as-warning suggests dark/moody. Current default is cream-on-ink; would a light "editorial broadsheet" look feel more authoritative?
- **Custom icons vs Lucide.** Lucide handles UI affordances but does *not* fit the food-vocabulary illustrations we'll want (a wheat ear, a vial, a barcode). Plan to commission or AI-generate a small custom illustration set later.

## Tech

- **CMS or no CMS?** Once the content shape is stable, do we move to Sanity (rich preview, structured), Tina (Markdown-first, git-backed), or stay on hardcoded TS forever? Migrating to Sanity is non-trivial — only do it when editorial bandwidth justifies it.
- **i18n.** Likely Spanish + Portuguese as priority languages (Latin America has high UPF prevalence and active policy interest). Paraglide is the SvelteKit-native choice. Defer until v1.
- **Analytics.** Plausible vs Umami vs none. We want scroll-depth + chapter-completion telemetry but not surveillance-style tracking.
- **Per-chapter Open Graph cards.** Vercel OG can generate them on the edge. Worth doing pre-launch for share-ability.

## Content gaps

- **Need original data viz.** Several chapters (5, 9) call for custom visualisations that don't exist yet. Sketch them before writing the GSAP timelines.
- **Image sourcing.** No image rights yet. Either licence editorial stock (Getty / AP) or commission illustration. Or go fully typographic.
- **Audio?** Subtle pulse on stat reveals could be powerful; could also be tacky. Test with one chapter before committing.
