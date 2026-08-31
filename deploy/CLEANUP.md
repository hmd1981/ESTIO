# Estio daily operational cleanup

Automated housekeeping for **operational garbage only** — temp files, stale auth nonces, stuck studio jobs, aged analytics events, and BullMQ cache entries. Financial, customer, and audit records are **never deleted**.

## Commands

From repo root (after `npm run build --workspace=api`):

```bash
npm run cleanup:dry-run   # report only — no deletes/updates
npm run cleanup:daily       # live run
```

From `apps/api`:

```bash
npm run cleanup:dry-run
npm run cleanup:daily
```

Production (Docker):

```bash
bash deploy/scripts/run-cleanup.sh --dry-run
bash deploy/scripts/run-cleanup.sh
```

## Schedule

| Method | File | When |
|--------|------|------|
| In-process cron | `CleanupCronService` | Daily 04:00 UTC (disable with `CLEANUP_CRON_ENABLED=false`) |
| systemd timer | `deploy/systemd/estio-cleanup.timer` | Daily 04:15 UTC (CLI via Docker) |
| cron | `deploy/cron/estio-cleanup.cron` | Daily 04:15 UTC |

Install systemd timer on the VM:

```bash
sudo cp deploy/systemd/estio-cleanup.{service,timer} /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now estio-cleanup.timer
```

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `CLEANUP_TEMP_FILE_HOURS` | `24` | Delete temp files under allowlisted tmp dirs |
| `CLEANUP_ORPHAN_ASSET_HOURS` | `48` | Delete unreferenced preview/sample files |
| `CLEANUP_STUCK_JOB_HOURS` | `6` | Fail/recover stuck `MediaGenerationJob` rows |
| `CLEANUP_AUTH_TOKEN_HOURS` | `24` | Purge expired/consumed `SiweNonce` rows |
| `CLEANUP_PAYMENT_PENDING_DAYS` | `7` | Mark old `pending` payments as `expired` |
| `CLEANUP_LOG_RETENTION_DAYS` | `14` | Remove non-error `.log` files (error logs 2× retention) |
| `CLEANUP_ANALYTICS_RETENTION_DAYS` | `90` | Purge raw `StudioEvent` / `AiStudioAskEvent` rows |
| `CLEANUP_EXTRA_TEMP_DIRS` | — | Comma-separated **uploads/** subpaths (allowlist extension) |
| `CLEANUP_DRY_RUN` | — | Set `true` for CLI dry-run |
| `CLEANUP_CRON_ENABLED` | `true` | Set `false` to disable in-process 04:00 cron |

## What is cleaned

| Category | Action | Retention |
|----------|--------|-----------|
| Temp files | **Delete** disk files | `uploads/tmp`, `uploads/.temp` (+ extras) |
| Orphan previews/samples | **Delete** disk files | `uploads/previews`, `uploads/samples` — must match `preview-*`, `sample-*`, or `temp-*` and not be referenced by `MediaAsset` or completed job payloads |
| Stuck media jobs | **Update** → `failed` + credit refund | `queued`/`running` older than threshold |
| SIWE nonces | **Delete** rows | Expired or consumed past TTL |
| Intake sessions | **Delete** incomplete rows | Incomplete & older than 7 days |
| Pending payments | **Update** → `expired` | Pending & older than threshold — **rows kept** |
| Application logs | **Delete** `.log` files | Under `logs/` allowlist only |
| Studio analytics raw events | **Delete** rows | Older than analytics retention |
| Ask Estio AI events | **Delete** rows | Same retention |
| Automation run log | **Delete** rows | Older than log retention |
| BullMQ Redis jobs | **Clean** completed/failed | Older than 24h grace |

## What is protected (never deleted)

- `Payment` rows (only status may change to `expired`)
- `CreditLedger` (append-only audit)
- `User`, `Lead`, `Inquiry`, CRM entities
- `CreditPack`, `PaymentWatcherCursor`
- Confirmed/failed payments and all wallet balances
- CMS `MediaAsset` rows and main `uploads/` library files outside allowlisted cleanup subdirs
- Admin/wallet JWT sessions (stateless — no DB rows)

## Safety rules

1. **Allowlisted directories only** — see `cleanup.config.ts` and `cleanup-path-guard.ts`
2. **Path guard** — every file delete calls `assertDeletableFile()` with `realpath` checks
3. **Explicit SQL** — all DB cleanup uses Prisma `deleteMany`/`updateMany` with `WHERE` retention windows
4. **Idempotent** — safe to re-run; ledger refunds and payment expiry are idempotent
5. **No `rm -rf`** on dynamic paths

## Dry-run report example

```json
{
  "dryRun": true,
  "startedAt": "2026-06-24T04:15:01.123Z",
  "finishedAt": "2026-06-24T04:15:01.456Z",
  "durationMs": 333,
  "counts": {
    "tempFilesDeleted": 3,
    "orphanAssetsDeleted": 1,
    "stuckJobsFailed": 2,
    "authTokensDeleted": 14,
    "portalSessionsExpired": 0,
    "paymentsMarkedExpired": 1,
    "logFilesRotated": 0,
    "analyticsEventsDeleted": 842,
    "askEventsDeleted": 56,
    "intakeSessionsDeleted": 0,
    "automationRunsDeleted": 12,
    "redisQueueJobsCleaned": 4
  },
  "details": [
    "[dry-run] temp file: /app/apps/api/uploads/tmp/temp-1a2b3c.png",
    "[dry-run] orphan asset: /app/apps/api/uploads/previews/preview-draft-9.png",
    "[dry-run] would fail stuck job 8f3c… (running)",
    "[dry-run] would delete 14 SiweNonce row(s)",
    "[dry-run] would mark 1 Payment row(s) expired (no deletes)",
    "[dry-run] would delete 842 StudioEvent row(s) older than retention"
  ],
  "skipped": [
    "Admin/wallet JWT sessions are stateless (no DB rows); portal IntakeSession cleanup runs separately.",
    "No OTP/magic-link/password-reset tables in schema; SiweNonce covers temporary wallet auth.",
    "Log directory missing (/app/apps/api/logs); skipped log rotation."
  ]
}
```

## Module layout

```
apps/api/src/modules/cleanup/
  cleanup.module.ts
  cleanup.service.ts          # core logic + dry-run
  cleanup-cron.service.ts     # @Cron 04:00 UTC
  cleanup.config.ts           # env + allowlists
  cleanup-path-guard.ts       # path safety
  cleanup.types.ts
  *.spec.ts                   # tests
apps/api/src/cleanup-cli.ts   # CLI entrypoint
```

## Tests

```bash
cd apps/api && npm test -- --testPathPattern=cleanup
```

Covers: dry-run side effects, protected tables, path guard, stuck job failure + refund, payment expiry without delete, auth token purge.
