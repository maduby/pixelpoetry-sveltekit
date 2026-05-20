---
name: add-chapter
description: Append a fully-typed `Chapter` to an existing Pixel Poetry explainer — eyebrow, title, intro, steps (with optional stat, quote, viz), accent, and any new sources/terms cited inline. Use when the user says "add a chapter to <slug>", "draft chapter <N>", "write the next chapter", or provides chapter copy that needs to be wired into the codebase.
---

# Add Chapter

Append one chapter to an existing explainer. Always one chapter at a time — quality compounds when each beat gets attention.

## Inputs (collect first if missing)

- **Slug**: which explainer, e.g. `ultra-processed` or `longevity`.
- **Chapter number**: next sequential integer.
- **Eyebrow**: typically `"Chapter <N>"`.
- **Emoji** (optional).
- **Title** + optional **shortTitle** for the mobile nav.
- **Intro**: 1–2 sentence hook.
- **Accent**: `red` | `amber` | `pink` | `ink`.
- **Steps**: 3–6 beats, each one of:
  - `narrative` — a paragraph with optional `richText` (`<strong>` only).
  - `stat` — value + label + optional context + sourceId.
  - `quote` — verbatim text + attribution + sourceId.
  - `viz` — typed object: `image`, `obs-bar`, `obs-timeline`, `donut`, `bar`, `bubble`, `line`.

If a step references a source not yet in `sources.ts`, add it. Same for terms.

## Files to edit

```
- [ ] src/lib/explainers/<slug>/chapters.ts  — append one Chapter object
- [ ] src/lib/explainers/<slug>/sources.ts   — add any new Source entries
- [ ] src/lib/explainers/<slug>/terms.ts     — add any new Term entries
- [ ] docs/ai/roadmap.md                     — move the chapter to "Done" with today's date
- [ ] docs/ai/daily-log.md                   — append the work item
```

If the chapter uses new imagery, also run the `build-images` skill before publishing.

## Chapter shape (TypeScript)

```ts
{
  id: '<kebab-id>',            // unique within the explainer; used as the anchor
  number: <N>,
  eyebrow: 'Chapter <N>',
  emoji: '<one emoji>',
  title: '<Title>',
  shortTitle: '<Shorter>',     // optional, falls back to title in mobile nav
  intro: '<1-2 sentence hook>',
  accent: '<red|amber|pink|ink>',
  steps: [
    {
      id: '<step-id>',
      text: '<plain-text fallback>',
      richText: '<HTML with <strong> spans, no user input>'
    },
    {
      id: 'stat-headline',
      text: '<the stat as a sentence>',
      stat: { value: '60', unit: '%', label: '<short>', context: '<one line of why>', sourceId: '<id>' }
    },
    {
      id: 'quote-x',
      text: '<plain fallback>',
      quote: { text: '<verbatim>', attribution: '<Author / Source>', sourceId: '<id>' }
    },
    {
      id: 'viz-y',
      text: '<plain fallback for SR>',
      viz: { type: 'obs-bar', title: '...', subtitle: '...', unit: '%', prefix: '+', sourceId: '<id>', data: [
        { label: 'A', value: 12 },
        { label: 'B', value: 47 }
      ] }
    }
  ],
  sources: ['<sourceId-1>', '<sourceId-2>']
}
```

## Step content rules

- `richText` must only contain `<strong>` tags. Any other tag is risky (it's rendered via `{@html}`).
- A step has at most ONE of `stat | quote | viz`. Plain narrative beats use neither.
- `stat.value` is a string (lets you write `"32"` or `"60%"` or `"4.5×"`). Add `unit` separately when it makes the layout cleaner.
- `quote.text` is verbatim. Use ellipses for omitted text. Don't paraphrase.

## Workflow

```
- [ ] 1. Read src/lib/explainers/<slug>/chapters.ts to find the next chapter number and existing ids.
- [ ] 2. Read src/lib/explainers/<slug>/sources.ts and terms.ts to see what's available.
- [ ] 3. Build the Chapter object from the inputs.
- [ ] 4. For each new source/term, append an entry with a sensible id; use peer-reviewed bibliographic format.
- [ ] 5. Append the chapter to the `chapters` array.
- [ ] 6. If a viz is used, sanity-check the data array matches the type signature.
- [ ] 7. Update docs/ai/roadmap.md (move to Done) and docs/ai/daily-log.md (append entry).
- [ ] 8. Print: a 1-line summary of the chapter + reminders for any missing assets (images, etc).
```

## Common pitfalls

- Forgetting to add the new sourceId in `sources.ts`.
- Using `<em>` or `<a>` inside `richText` (only `<strong>` is safe).
- Two consecutive chapters with the same accent.
- Stat values without `sourceId` — every number must cite.
- Quote text not verbatim.

## After this skill

If a viz needs new imagery, run `build-images`. If the data shape is unfamiliar, run `pick-viz` first to confirm the right chart component.
