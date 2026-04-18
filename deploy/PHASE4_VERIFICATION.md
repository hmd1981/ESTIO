# Phase 4 — Generation credits (verification runbook)

This runbook validates that wallet-authenticated generation is credit-gated, debits are atomic with job acceptance, refunds follow policy, and the UI reflects balance/cost/error states.

## Prerequisites

- API and web deployed (or local) with the Phase 4 Prisma migration applied (`CreditLedgerReason` includes `generation_debit`, `generation_refund`, `generation_reservation`, `generation_reservation_release`).
- `npx prisma generate` run after migration.
- Wallet session can obtain a JWT (`POST /auth/wallet/...` flow as in production).
- Optional: set `PHASE2_COST_*` env vars; pricing API and debit both use `mediaJobCreditCost` / `getGenerationPricingDto()`.

## API endpoints (reference)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/credits/generation-pricing` | Public | Per-mode credit costs (matches debit rules). |
| GET | `/credits/balance` | Wallet JWT | Current balance. |
| GET | `/media/jobs/preflight?mode=…` | Wallet JWT | Quote: `costCredits`, `balance`, `sufficient`, `shortfall`. |
| POST | `/media/jobs` | Wallet JWT | Create job; debit in same transaction as job row. |
| GET | `/media/jobs/:id` | Public | Status poll. |
| GET | `/credits/ledger` | Wallet JWT | Ledger history. |

**Web BFF (same-origin):** `/api/credits/generation-pricing`, `/api/media/jobs/preflight`, `/api/credits/balance`, `POST /api/media/jobs`.

## Ledger semantics (Phase 4)

- **generation_debit:** One row per accepted job debit (`refType=job`, `refId=<jobId>`). Idempotent via unique `(refType, refId, reason)`.
- **generation_refund:** On terminal failure paths where policy refunds; idempotent with distinct `refId` suffix pattern (see `CreditsService.refundJob`).
- **generation_reservation / generation_reservation_release:** Enum values reserved for a future reservation flow; current production path is **debit-on-accept** inside the job-create transaction.

## Lifecycle (intended behavior)

1. **Accepted job:** Debit + job row commit together; enqueue runs after. Response may include `credits: { debited, balanceAfter }`.
2. **Failed before enqueue:** Job row removed or not committed with debit; refund helper runs if a debit row existed (should not for failed tx).
3. **Failed after enqueue:** Worker/processor sets failed; refund path runs once if debited.
4. **Worker offline / 503:** `assertWorkerOnlineForSubmit` runs **before** DB write → **no charge**.
5. **Cancelled / timeout:** Treated as terminal failure where applicable; refund once if policy requires.
6. **User retry:** New job id → new debit if accepted (separate ledger ref).
7. **Duplicate submit:** Same job idempotency on ledger prevents double debit for the same `(refType, refId, reason)`.

## Checklist (manual)

1. **Sufficient credits:** Submit succeeds; balance drops by `costCredits`; ledger shows one `generation_debit` for that job id.
2. **Insufficient credits:** Preflight shows `sufficient: false`; submit returns `402` with `code: INSUFFICIENT_CREDITS`, `requiredCredits`, `shortfall`, `balance`; no new job row that completed enqueue without matching expectations (no silent accept).
3. **Duplicate submit:** Repeat identical client double-post only creates one debit for one job id (or safe no-op on ledger conflict).
4. **Worker offline:** With worker probe offline, `POST` returns **503** with `WORKER_OFFLINE`; balance unchanged.
5. **Failed job + refund:** Force failure after debit; balance restored; ledger shows exactly one `generation_refund` for that refund ref; no duplicate refunds on retry of refund logic.
6. **Completed job:** Final balance equals prior minus one debit (no refund).
7. **Ledger audit:** Each debit/refund appears once; amounts reconcile with balance.
8. **Concurrent submits:** Two parallel submits for users at credit limit cannot both debit below zero (DB transaction + append invariant).
9. **UI:** Balance and cost visible; insufficient state distinct from GPU offline; after submit/refund, balance refresh (event `estio:credits-changed`).
10. **Pricing vs debit:** `GET /credits/generation-pricing` mode credits equal `mediaJobCreditCost(mode)` used at debit.

## Automated tests

From `apps/api`:

```bash
npx jest src/modules/media --no-cache
```

Add further credit-race tests under `credits` or `media` as the ledger layer grows.
