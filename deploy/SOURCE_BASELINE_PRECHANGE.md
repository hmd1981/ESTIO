# ESTIO source baseline — prechange capture

Captured: 2026-08-31 UTC (fr-vmv2-medium)

## Identity

| Field | Value |
|-------|-------|
| Hostname | fr-vmv2-medium |
| Repository | /root/estio-platform |
| Remote | git@github.com:hmd1981/ESTIO.git |
| Branch | main |
| OLD HEAD | 6e629b7df4ac030aa719c67aa821d97e7b1c26c9 (2026-04-18) |

## Production (unchanged during reconciliation)

| Service | Container ID | Image digest | Started |
|---------|--------------|--------------|---------|
| api | 02dd07bdeda6… | sha256:9fbf9dd59a8bc94be5649a9c1bc632fa209eed2525103360018d67e2a8907179 | 2026-08-24T13:52:58Z |
| web | 125c67e6afa6… | sha256:9a755b1db569c1ad6ad206ad1c2cf5721688804b8b7feb9e9d66f60cb579f4d7 | 2026-08-24T13:52:58Z |
| admin | b1363e1ae84d… | d0ad60df4428 | 2026-08-08 |
| postgres | 75d77e97de4f… | postgres:16-alpine | 2026-07-28 |
| redis | 21948cf525cb… | redis:7-alpine | 2026-07-28 |

## Public health (prechange)

- https://estio.org/ → 308 → /en → 200 (expected)
- https://api.estio.org/ → 200

## Prisma schema checksums

| Source | SHA256 |
|--------|--------|
| Git HEAD | 54153eadcfdfbd2d89607e5573392d201fd54d9651bd2bc6ac4c2077b401afa5 |
| Host working tree | f5a1ac940f27c928dc5337035310092f937104f45487e0117d61e52e3641a360 |
| Running API image | f5a1ac940f27c928dc5337035310092f937104f45487e0117d61e52e3641a360 |

**Finding:** Host and running image match. HEAD is stale (missing Phase 4 enum values).

## Git working tree (prechange)

- Modified tracked files: 143
- Untracked production source: ~70 paths (resources, legal, cleanup, migration, portfolio, SEO)
- Untracked sensitive: `.env.bak.before-phase2` (quarantined to `/root/.cursor-quarantine/estio-secrets/`)

## Migration (untracked prechange)

`apps/api/prisma/migrations/20260418210000_phase4_generation_ledger_reasons/migration.sql`

Contents: four `ALTER TYPE "CreditLedgerReason" ADD VALUE IF NOT EXISTS` statements only.
Present inside running API image migrations directory.

## Secret scan blockers (prechange)

1. `.env.bak.before-phase2` — real secrets; must never enter Git
2. `deploy/nginx/install-on-server.sh` — false positive risk from PEM header echo text (no embedded credentials)

## Reconciliation principle

Running production image built 2026-08-24 from dirty host tree is authoritative.
Do **not** revert host Prisma or application source to April 2026 HEAD.
