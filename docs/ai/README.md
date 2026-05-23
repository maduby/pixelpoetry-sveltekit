# AI Workflow Knowledge Base

> This folder is the AI-facing operational memory for the Pixel Poetry project. It lets any agent (Claude, Cursor, etc.) pick up where the last one left off without re-explaining the project. Treat every file here as living documentation.

## What lives where

| File                         | Purpose                                                                                                      | Update cadence                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| `README.md`                  | This index. Start here.                                                                                      | When workflow changes           |
| `project-brief.md`           | The "what & why" — one-page product brief.                                                                   | When goals shift                |
| `architecture.md`            | Tech stack, conventions, folder structure, dependencies.                                                     | When stack changes              |
| `roadmap.md`                 | Prioritised backlog: backlog → now → next → done. The single source of truth for "what to work on".          | Daily                           |
| `daily-log.md`               | Append-only journal: what was done, why, what's next. New entry per working day.                             | Every session                   |
| `decisions.md`               | ADR-style record. Every meaningful technical or design choice gets a one-paragraph entry.                    | When a decision is made         |
| `prompts.md`                 | Reusable prompts: "make a new chapter", "add a stat card", etc. Most are now skills under `.cursor/skills/`. | When a useful pattern emerges   |
| `glossary.md`                | Domain terms (NOVA, GRAS, BMJ umbrella review, hazard ratio…) so any agent gets the vocabulary right.        | When new terms surface          |
| `open-questions.md`          | Unresolved design/product questions. Move them to `decisions.md` once answered.                              | Whenever blocked                |
| `saved-insights-ai.md`       | Saved-insights AI implementation notes: provider, schema, Resend, PostHog events, prompt version.            | When AI feature changes         |
| `neon-migration-workflow.md` | Safe Neon migration flow: local → staging duplicate → staging → main duplicate → main.                       | When DB release process changes |

## Operating rules for agents

1. **Read `roadmap.md` first.** Pick the top-most `🔥 now` task. If empty, look at `next`.
2. **Append to `daily-log.md` at session start and end.** Use the template at the bottom of that file.
3. **Log every non-trivial choice in `decisions.md`.** Format: date, decision, alternatives considered, why.
4. **Move items, don't delete.** Done tasks move to `done` section of `roadmap.md` with a date.
5. **If you discover a recurring task, capture it in `prompts.md` — or better, add a skill under `.cursor/skills/`.**
6. **If you're blocked, add to `open-questions.md` and pick another task.**
7. **Never invent facts.** Cite `docs/explainers/<slug>/facts.md` or `docs/explainers/<slug>/scrollytelling-facts.md`. The PDFs in `docs/explainers/<slug>/sources/` are the originals.

## Skills (live under `.cursor/skills/`)

These automate the most common operations on this codebase:

- `source-extraction` — Triage source PDFs/articles into `facts.md` + `scrollytelling-facts.md`.
- `story-concept` — Turn facts into a chapter arc and a hero claim.
- `scaffold-explainer` — Scaffold a new explainer route, lib folder, and assets directory.
- `add-chapter` — Append a new chapter to an existing explainer.
- `pick-viz` — Decide which chart component fits a piece of data and produce the config blob.
- `build-images` — Process new originals and refresh per-explainer image manifests.

## Quick references

- Explainer index → `src/lib/data/explainers.ts`
- Per-essay data → `src/lib/explainers/<slug>/`
- Per-essay assets → `static/explainers/<slug>/`
- Per-essay docs → `docs/explainers/<slug>/`
- Live site (production) → https://pixelpoetry.dev _(domain to be configured in Vercel)_
