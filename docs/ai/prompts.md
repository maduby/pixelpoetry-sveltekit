# Prompts Library

> The most common recurring tasks have been promoted to **Cursor skills** under `.cursor/skills/`. This file keeps the prompt snippets handy in case you're using a different agent / tool that doesn't auto-load skills.

---

## Quick lookup

| Task | Skill | One-line prompt |
|------|-------|-----------------|
| Read research, produce facts file | `source-extraction` | "extract the facts from `docs/explainers/<slug>/sources/`" |
| Turn facts into a chapter arc | `story-concept` | "draft a scrollytelling structure for `<slug>`" |
| Create the route + lib folder for a new essay | `scaffold-explainer` | "scaffold a new explainer, slug=`<slug>`" |
| Add a chapter to an existing essay | `add-chapter` | "add a chapter to `<slug>`: …" |
| Pick a chart component for some data | `pick-viz` | "what viz fits this data?" |
| Process new images and update the manifest | `build-images` | "rebuild images for `<slug>`" |

---

## Add a new chapter (manual, mirrors `add-chapter` skill)

```
Add a new chapter to the <slug> explainer.

Source facts: docs/explainers/<slug>/facts.md §<N> "<section name>"
Chapter number: <N>
Chapter id (kebab): <chapter-id>
Title: <Title>
Eyebrow: 'Chapter <N>'
Intro (1–2 sentences): <intro>
Accent: red | amber | pink | ink
Steps (each is a scroll beat): list 3–6 with optional stat, quote, or viz.

Update:
1. src/lib/explainers/<slug>/chapters.ts — append a Chapter object.
2. src/lib/explainers/<slug>/sources.ts — add any new sources cited.
3. docs/ai/roadmap.md — move the chapter from Backlog/Next to Done with today's date.
4. docs/ai/daily-log.md — append the work item.

Constraints:
- Every stat must cite a source id from src/lib/explainers/<slug>/sources.ts.
- Use semantic HTML in richText (<strong>) — never user-input HTML.
- Honour prefers-reduced-motion (the <Scrolly> primitive already does this).
```

## Add a new GSAP-driven attachment

```
Create a new attachment in src/lib/attachments/<kebab-name>.ts.

Signature:
  export function <name>(options?): Attachment

Requirements:
- Lazy-import gsap + any plugins inside the attachment body (so they tree-shake out of pages that don't use them).
- gsap.registerPlugin(ScrollTrigger) once, guarded by a module-level flag.
- Return a cleanup function that kills the timeline / ScrollTrigger instance.
- Honour matchMedia('(prefers-reduced-motion: reduce)') and skip animation if reduced.
- Add JSDoc + an example usage on the export.

Then wire it on a component with {@attach name(...)}.
```

## Refactor a component to Svelte 5 runes

```
Refactor <ComponentName> to Svelte 5 idioms.

- Replace `export let` with `$props()` destructured.
- Replace `$:` with `$derived` (pure) or `$effect` (side-effecting).
- Replace stores-of-local-state with `$state`.
- Replace `on:click` with `onclick`.
- Replace named slots with snippets + `{@render}`.
- Re-run pnpm check; no new errors.
```

## Add a Lucide icon

```
Add the <icon-name> icon from lucide-svelte.

import IconName from 'lucide-svelte/icons/<icon-name>';
<IconName size={20} aria-hidden="true" />

Always size with the `size` prop (not Tailwind w/h) so the SVG stays crisp.
Always set aria-hidden="true" if decorative, or an aria-label if standalone.
```

## Open a new daily session

```
Read docs/ai/roadmap.md and docs/ai/daily-log.md.
Append a new "## YYYY-MM-DD — <theme>" header to daily-log.md.
Pick the top task under '🔥 Now'. If empty, pick from 'Next'.
Update todos and start.
```

## Close a session

```
Update docs/ai/daily-log.md with:
- What was shipped (1–5 bullets)
- Decisions made (link to decisions.md)
- Open questions (link to open-questions.md)
- 1–3 bullets for "Next session — start here"
```
