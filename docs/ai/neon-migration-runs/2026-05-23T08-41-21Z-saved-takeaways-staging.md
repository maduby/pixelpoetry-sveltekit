# Neon Migration Run

- Created at: 2026-05-23T08:41:21Z
- Migration: saved takeaways AI tables
- Project: quiet-unit-67188191
- Local branch: configured local Neon branch from `.env.local`
- Disposable staging branch: migration-check/staging/2026-05-23T08-41-21Z
- Disposable staging branch id: br-twilight-union-al9lm3vn
- Parent staging branch: staging
- Parent staging branch id: br-green-dust-alx1apmo
- Database: neondb

## Result

1. `pnpm db:migrate` completed successfully against the locally configured Neon branch.
2. Drizzle migrations completed successfully against the disposable staging branch.
3. The disposable branch was verified to contain:
   - `saved_insight`
   - `insight_summary`
   - `insight_email_delivery`
4. Drizzle migrations completed successfully against the real `staging` branch.
5. The real `staging` branch was verified to contain the same three tables.
