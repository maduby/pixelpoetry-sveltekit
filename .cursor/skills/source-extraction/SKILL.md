---
name: source-extraction
description: Triage raw research material (PDFs, articles, transcripts, podcast notes, datasets) into a structured `facts.md` compendium and a scrollytelling-ready `scrollytelling-facts.md` brief for a Pixel Poetry explainer. Use when the user asks to "extract facts", "build a research compendium", "summarise sources", "turn this PDF into facts", or drops files into `docs/explainers/<slug>/sources/` and wants them processed.
---

# Source Extraction

Turn a pile of source material under `docs/explainers/<slug>/sources/` into two structured documents that drive every later authoring step.

## Inputs

- `docs/explainers/<slug>/sources/*.pdf` — primary literature.
- `docs/explainers/<slug>/sources/*.md` — transcripts, scraped articles, hand-notes.
- Optional: URLs the user pastes inline.

## Outputs

1. **`docs/explainers/<slug>/facts.md`** — exhaustive, citation-ready research compendium.
2. **`docs/explainers/<slug>/scrollytelling-facts.md`** — opinionated subset shaped for a scroll-driven essay: hero claim, chapter beats, marquee stats, hero quotes, viz suggestions.

If `<slug>` does not exist yet, prompt the user to run the `scaffold-explainer` skill first.

## Workflow

```
- [ ] 1. List the files under docs/explainers/<slug>/sources/
- [ ] 2. Read each source in turn, extracting:
       - direct quotations (with speaker / paper / page)
       - numeric facts (with unit + source + year)
       - definitions of key terms
       - dates and timelines
       - methodological caveats
- [ ] 3. De-duplicate; reconcile conflicting numbers (note the disagreement).
- [ ] 4. Write facts.md using the template below.
- [ ] 5. Write scrollytelling-facts.md curating the most arresting material.
- [ ] 6. Print a short summary: # sources read, # facts extracted, suggested next skill (`story-concept`).
```

## facts.md template

```markdown
# <Explainer Title> — Research Compendium
### Facts, Data & Source Index

> Primary sources: <bulleted list with publication year>

---

## 1. <Section name — e.g. "What is X?">

### Definitions
- **<term>**: <plain-language definition>. Source: <citation>.

### Key facts
- <fact> — <number with unit>. Source: <citation, year>.

### Quotable
> "<verbatim quote>" — <attribution, source>

---

## 2. <Next section> …
```

## scrollytelling-facts.md template

```markdown
# <Explainer Title> — Scrollytelling Brief

## Hero claim
<one-sentence headline argument that the entire essay defends>

## Hero stat (above the fold)
<a single number that lands like a punch, with source>

## Chapter arc (working draft)

### Chapter 1: <Eyebrow> — <Title>
- **Intro:** <1–2 sentences>
- **Beats:**
  1. <narrative beat with a richText hint>
  2. <stat reveal: value + label + sourceId>
  3. <quote: text + attribution>
  4. <viz suggestion: ObsBarChart / ObsTimelineChart / DonutChart / ImageChart / StatCard>
- **Accent:** red | amber | pink | ink

### Chapter 2 …

## Hero quotes (1–2 per chapter)

## Recommended terms to define inline
- `<term-id>` — <one-sentence definition>

## Image / viz wishlist
- Editorial photo: <subject>
- Bar chart: <X-axis vs Y-axis, source>
- Timeline: <metric over years>
```

## Rules

- **Never invent.** Every fact in `facts.md` cites a source. If you can't cite it, drop it.
- **Reconcile conflicts in-place.** If two sources disagree, list both with a one-line note.
- **Numbers carry units.** "60% of British diet" not "60%".
- **Quotes are verbatim.** Use ellipses (`…`) for omitted text inside a quote.
- Keep `facts.md` long; keep `scrollytelling-facts.md` curated.

## After this skill

The next likely skill is `story-concept` (to refine the chapter arc) or `add-chapter` (if the arc is already solid).
