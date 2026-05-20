---
name: story-concept
description: Design or refine the scrollytelling structure for a Pixel Poetry explainer — chapter arc, accent palette, hero claim, closing note, per-chapter beats and viz recommendations. Use when the user asks to "draft the chapters", "design the story", "propose a chapter arc", "what should the structure be", or after running `source-extraction` and reviewing the facts.
---

# Story Concept

Turn a `facts.md` (and a `scrollytelling-facts.md` draft) into a concrete, opinionated, chapter-by-chapter plan that the engine can execute.

## Inputs

- `docs/explainers/<slug>/facts.md`
- `docs/explainers/<slug>/scrollytelling-facts.md` (if it exists — refine; if not — create from facts alone)
- The user's editorial brief (tone, target audience, length budget)

## Output

Rewrite `docs/explainers/<slug>/scrollytelling-facts.md` with a finalised structure ready to be implemented via `add-chapter`. Print a one-page summary to the chat.

## Story shape — the Pixel Poetry rhythm

A canonical Pixel Poetry essay is **6–10 chapters**, **8–15 minutes** of read time. The arc usually follows:

| Beat | Purpose |
|------|---------|
| **Hero** | The one-line claim. A single arresting stat above the fold. |
| **Chapter 1 — The setup** | Define the subject. Show its scale. |
| **Chapters 2–3 — The mechanism** | How does it actually work? |
| **Chapters 4–6 — The consequences** | What does it do to bodies / society / the planet? |
| **Chapter 7 — The system behind it** | Who profits? Who decides? |
| **Chapter 8 — The inequality lens** | Who pays the cost first? |
| **Chapter 9 — What now** | Policy, behaviour, hope, or the open question. |
| **Closing** | One sentence that lands. |

Not every essay needs all of these. Cut ruthlessly.

## Per-chapter check

Each chapter should have:

- A short **eyebrow** ("Chapter 3")
- An **emoji** (optional, but it's a Pixel Poetry signature)
- A **title** — slab-headline friendly, ideally ≤6 words
- A **1–2 sentence intro** that frames the beat
- **3–6 steps**. Each step is a scroll beat. Mix:
  - narrative paragraphs (with `richText` `<strong>` highlights)
  - `stat` reveals (big number + label + sourceId)
  - `quote` blocks (verbatim quote + attribution + sourceId)
  - `viz` objects (`ObsBarChart`, `ObsTimelineChart`, `DonutChart`, `ImageChart`, `StatCard`)
- An **accent**: `red` (alarm, urgency), `amber` (curiosity, evidence), `pink` (cultural, soft critique), `ink` (sober, definitional)

## Viz pacing

A good chapter has **1 hero visual** and **1 supporting visual at most**. Don't put a chart on every step.

For viz choice, run the `pick-viz` skill on each candidate dataset.

## Rules

- **Hero claim must be defensible.** If you can't point at a peer-reviewed source for it, water it down.
- **Cite every number.** Each `stat.value` references a `sourceId` that exists in `sources.ts`.
- **One pull quote per chapter, max.** Quotes are precious; over-use cheapens them.
- **Closing note is one sentence.** Not a paragraph.
- **Accent rhythm.** Don't run two adjacent chapters on the same accent unless deliberate.

## Output template

```markdown
# <Explainer Title> — Scrollytelling Brief (locked)

## Hero claim
<single sentence>

## Hero stat
<value> — <one-line label> — sourceId: <id>

## Chapter arc

### Chapter 1: <Eyebrow> — <Title> · accent: <red|amber|pink|ink> · emoji: <one>
> Intro: <1–2 sentences>

| # | type | content | sourceId |
|---|------|---------|----------|
| 1 | narrative | <richText hint with <strong> tags> | — |
| 2 | stat | <value>, <label>, <context> | <id> |
| 3 | viz: obs-bar | <subtitle> — data: <one line> | <id> |
| 4 | quote | "<verbatim>" — <attribution> | <id> |

(repeat for every chapter)

## Closing note
<one sentence>

## Terms to define inline (`data-term`)
- `<id>` — <name> — <one-sentence definition>
```

## After this skill

Hand off to the `add-chapter` skill (one chapter at a time) or do the whole essay in one batch — usually one chapter at a time produces better prose.
