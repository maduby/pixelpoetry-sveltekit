---
name: pixelpoetry-source-grounding
description: Use when adding, editing, migrating, or debugging Pixel Poetry explainer sources, source chunks, source retrieval, or grounded saved-takeaway AI recaps.
---

# Pixel Poetry Source Grounding

Pixel Poetry recaps must be grounded in the editorial evidence base, not in model memory.

## Core Workflow

1. Read `docs/ai/source-grounding.md`.
2. Keep canonical editorial sources in each explainer's `sources.ts`.
3. Register every explainer in `src/lib/explainers/registry.ts`.
4. Put `sourceId` on chapter sources, stats, quotes, charts, and images where evidence supports a claim.
5. Run `pnpm sources:ingest` after source edits.
6. For schema changes, run `pnpm db:generate`, inspect generated SQL, and keep `CREATE EXTENSION IF NOT EXISTS vector;` before any `vector(...)` column.
7. Run `pnpm check`.

## Guardrails

- Reader-selected text stays in `saved_insight`; do not mix private reader content into public source chunks.
- AI may cite only source IDs supplied by retrieval as `allowedSources`.
- Do not ask the model to discover citations from memory.
- Embeddings are optional and provider-swappable. If no compatible embedding endpoint is configured, lexical/context retrieval is expected.
- Do not delete stale source chunks during ingestion unless the user explicitly asks for cleanup and the target source registry has been reviewed.

## Neon

For staging or production migrations, use the disposable-branch workflow:

```bash
pnpm neon:migrate:verify --parent=staging
pnpm neon:migrate:apply --target=staging --verified-branch=<verified-branch> --confirm=staging
```

Run `pnpm sources:ingest` against the same branch after migration.
