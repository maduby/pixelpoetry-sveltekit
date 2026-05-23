# Neon Migration Workflow

## Rule

Do not migrate the Neon `main` production branch directly from an unverified local migration.

Every migration moves through this path:

1. Local development branch
2. Disposable duplicate of `staging`
3. `staging`
4. Disposable duplicate of `main`
5. `main`

The disposable branches are created from the target parent branch, migrated, and then treated as proof that the same migration set can apply to the real target.

## Environment

Add these to `.env.local` and Vercel project envs as appropriate:

```env
NEON_API_KEY=
NEON_PROJECT_ID=
NEON_DATABASE_NAME=pixelpoetry
NEON_ROLE_NAME=
NEON_STAGING_BRANCH=staging
```

The runtime app should keep using:

```env
DATABASE_URL=<pooled branch connection string>
DATABASE_URL_UNPOOLED=<direct branch connection string>
```

Use pooled URLs for app runtime and direct/unpooled URLs for migrations.

## Local

Use your local/dev Neon branch connection string in `.env.local`, then run:

```sh
pnpm db:generate
pnpm db:migrate
pnpm check
```

## Staging

Verify first on a disposable branch copied from `staging`:

```sh
pnpm neon:migrate:verify --parent=staging
```

The script:

- creates `migration-check/staging/<timestamp>`
- creates a read-write compute endpoint
- applies Drizzle migrations there
- writes a report under `docs/ai/neon-migration-runs/`
- prints the exact apply command

After reviewing the report, apply to staging:

```sh
pnpm neon:migrate:apply --target=staging --verified-branch=<printed-branch> --confirm=staging
```

## Production

Verify first on a disposable branch copied from `main`:

```sh
pnpm neon:migrate:verify --parent=main
```

After reviewing the report, apply to production only with the explicit production gate:

```sh
ALLOW_PRODUCTION_MIGRATION=true pnpm neon:migrate:apply --target=main --verified-branch=<printed-branch> --confirm=main
```

The script refuses production migration unless:

- a verified branch is supplied
- that branch is a direct child of `main`
- `--confirm=main` is supplied
- `ALLOW_PRODUCTION_MIGRATION=true` is set

## Cleanup

Disposable branches are created with a 24-hour expiry by default. They can also be deleted manually in Neon after the migration is promoted.

## References

- Neon branches are isolated copy-on-write clones.
- Neon branch creation does not increase load on the parent branch.
- Neon CLI/API support branch creation and schema-diff workflows.
