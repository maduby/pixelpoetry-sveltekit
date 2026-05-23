# Neon Migration apply

- Created at: 2026-05-23T09:43:00Z
- Target branch: staging (br-green-dust-alx1apmo)
- Disposable verified branch: migration-check/staging/source-grounding-2026-05-23T09-42-54Z (br-icy-band-alvln6tm)
- Disposable expires at: 2026-05-24T09:42:54Z
- Migration: `drizzle/0003_bouncy_james_howlett.sql`

## Result

Drizzle migrations completed successfully on the disposable branch first, then on the real Neon `staging` branch.

After migration, `pnpm sources:ingest` was run against staging and upserted:

- 36 source documents
- 191 source chunks
- 0 embedded chunks (`SOURCE_EMBEDDINGS_ENABLED=false`)
