# Source Grounding For Saved Takeaways

## 2026-05-23 — Implementation

Pixel Poetry now stores the explainer evidence base separately from private reader takeaways, then connects the two during save and recap generation.

## Shape

- `source_document`: one canonical source per explainer/source ID (`short`, `full`, `url`, `year`, `content_hash`).
- `source_chunk`: citation/reference chunks, step-linked chunks, and optional `vector(1536)` embeddings.
- `saved_insight_source_match`: private join rows from a reader takeaway to the best matching source chunks.
- `insight_summary_source`: source chunks used by a generated recap.

Embeddings are provider-swappable and off by default. When no embedding endpoint is configured, retrieval uses local lexical scoring plus known `explainer_slug`, `chapter_id`, and `step_id` context. This keeps the feature useful today and vector-ready later.

## Env

```env
SOURCE_EMBEDDINGS_ENABLED=false
EMBEDDING_API_KEY=
EMBEDDING_BASE_URL=
EMBEDDING_MODEL=
EMBEDDING_DIMENSIONS=1536
```

Only enable embeddings after confirming the provider returns exactly 1536 dimensions or after changing the schema and migration to the provider's dimension.

## Commands

```bash
pnpm db:generate
pnpm db:migrate
pnpm sources:ingest
pnpm check
```

`pnpm sources:ingest` reads `src/lib/explainers/registry.ts`, upserts all canonical sources and chunks, and optionally backfills embeddings when `SOURCE_EMBEDDINGS_ENABLED=true`.

## Retrieval Rules

- Filter first by `explainer_slug`.
- Prefer exact `step_id`, then matching `chapter_id`, then explainer-level source chunks.
- Attach top source matches to the saved takeaway.
- During recap generation, provide the model only the selected takeaways and the retrieved `allowedSources`.
- The model must cite only supplied `sourceId` values. If the retrieved snippets do not support a point, it should not cite anything.

## Future Explainer Checklist

1. Add the explainer's `sources.ts`, `chapters.ts`, and `meta.ts`.
2. Register it in `src/lib/explainers/registry.ts`.
3. Use `sourceId` on chapter sources, stats, quotes, charts, and images wherever a claim depends on evidence.
4. Run `pnpm sources:ingest` locally.
5. Run the Neon disposable-branch verification before applying migrations or ingestion to staging.

## Notes

- Reader-selected text remains private user data in `saved_insight`.
- Source documents and chunks are editorial/public evidence records.
- AI should never discover citations from model memory; retrieval provides the allowed citation universe.
