# Phase 3 — Wallet credits & SIWE (audit, behavior, production verification)

This document summarizes what the codebase already provided before this phase, what was added for Phase 3 completion, and how to verify end-to-end in production **without** changing infrastructure topology.

## 1) Audit — implemented vs gaps (pre–Phase 3 UI / hardening)

| Area | Already in place | Gap addressed in Phase 3 |
|------|------------------|---------------------------|
| **Identity** | `User.walletAddress` unique; JWT `sub` = wallet; `WalletAuthGuard` | Session validation via `GET /auth/wallet/me` on the web app (BFF + client hook) |
| **SIWE** | Nonce + verify + JWT issuance | Same; UI remains EIP-1193 + `personal_sign` (no infra change) |
| **Credit packs** | `GET /payments/packs`, DB-driven | Web: removed misleading silent fallback packs; retry + empty/error states |
| **Create payment** | `POST /payments/create` | Unchanged contract |
| **Watcher → credit** | Single transaction: `pending` → `confirmed` + idempotent `payment_credit` ledger row | Watcher: batch-expire stale `pending`; match only non-expired intents |
| **Balance** | `GET /credits/balance` | Same; UI shows explicit loading state |
| **Ledger** | Append-only + unique `(refType, refId, reason)` | **New** `GET /credits/ledger?limit=&cursor=` + Studio activity table |
| **IP** | Throttling on nonce/verify (Nest throttler) | No change; IP is not used as primary identity |

## 2) Backend — automatic credit (unchanged flow, two safety tweaks)

**Flow (existing):**

1. Authenticated user creates payment → `payments` row `status=pending`, unique `expectedAmountAtomic`.
2. `PaymentWatcherService` scans USDC `Transfer` logs to the treasury address.
3. On match, **one** Prisma transaction: `updateMany` pending→`confirmed` (exactly one row wins) → `CreditsService.creditForPayment` → ledger row `reason=payment_credit`, `refType=payment`, `refId=<paymentId>`.

**Idempotency (existing):**

- Unique ledger index + `append()` early return + `P2002` handling.
- Payment flip uses `updateMany` with `status=pending` so duplicate scans do not double-credit.

**Phase 3 additions:**

- **Batch expire:** each watcher tick runs `updateMany` for `pending` rows past `expiresAt` → `expired` (no reliance on status polling only).
- **Match rule:** candidate payments must satisfy `expiresAt > now()` so late transfers do not attach to expired intents.

**New API:**

| Method | Path | Auth | Response |
|--------|------|------|----------|
| GET | `/credits/ledger` | Bearer wallet JWT | `{ items: [...], nextCursor }` — cursor is last row `id` |

## 3) Web — wallet auth UI

| Step | UI / route |
|------|------------|
| Connect | AI Studio `#studio-credits` — “Connect wallet” |
| Sign | Wallet `personal_sign` on server-built message |
| Session | `localStorage` + `useWalletSession`; optional **401** clears bad tokens via `/api/auth/wallet/me` |

## 4) Web — buy credits UI

| State | What the user sees |
|-------|---------------------|
| Loading packs | “Loading packs…” |
| Pack API error | Error + **Retry** (no fake prices) |
| Empty catalog | “Not available” message; buy disabled |
| Browse | Pack cards + Buy |
| Creating | “Creating payment…” |
| Pending | Amount, treasury address, QR, countdown, “Waiting for payment…” |
| Confirmed | Success + balance refresh + `estio:credits-changed` |
| Expired / failed | Terminal copy + **Try again** |
| Error (create) | Message + recovery |

Checkout marketing page (`/[locale]/checkout`) links to **AI Studio → credits** for USDC top-up (card/invoice flow remains contact).

## 5) Web — balance & ledger UI

- **Balance:** `useCreditBalance` — shows loading (`…`) while fetching.
- **Ledger:** “Show activity” expands a table (when, reason, Δ, balance after) with **Load more** when `nextCursor` is present.

## 6) Production verification checklist

Run these **in order** on the live stack (same host / same API the site uses).

### A. API health

1. `curl -sS https://api.estio.org/payments/health | jq`  
   - Expect `ready: true`, plausible `receivingAddress`, `chain` / `chainId` for Base.

### B. Packs

2. `curl -sS https://api.estio.org/payments/packs | jq`  
   - Expect non-empty `active` packs with `code`, `credits`, `usdcAmount`.

### C. Wallet auth

3. In the browser (AI Studio → Credits): **Connect wallet** → sign SIWE.  
4. DevTools → Application → Local Storage: `estio.walletToken` present.  
5. `curl -sS -H "Authorization: Bearer <token>" https://api.estio.org/auth/wallet/me | jq`  
   - Expect `user.walletAddress` matching connected account.

### D. Balance & ledger (empty or with history)

6. `curl -sS -H "Authorization: Bearer <token>" https://api.estio.org/credits/balance | jq`  
7. `curl -sS -H "Authorization: Bearer <token>" "https://api.estio.org/credits/ledger?limit=10" | jq`  
   - Expect `{ items: [...], nextCursor }`.

### E. End-to-end payment → credit

8. Create a payment from the UI; note **exact USDC amount** and treasury address.  
9. Send USDC on **Base** from the wallet to the treasury for that **exact** atomic amount.  
10. Wait for confirmation (UI polling + watcher).  
11. UI: state → **confirmed**; balance increases once.  
12. DB (operator):  
    - `payments`: one row `status=confirmed`, `tx_hash` set.  
    - `credit_ledger`: one row `reason=payment_credit`, `ref_type=payment`, `ref_id=<payment uuid>`.  
13. Repeat click/status poll: balance **unchanged** (idempotent).

### F. Expiry (optional)

14. Create payment; wait past TTL **without** paying.  
15. Status endpoint / UI → **expired**; send USDC **after** expiry → must **not** confirm (new payment intent required).

### G. Abuse / rate limits (sanity)

16. Rapid nonce requests from one IP should hit throttle (429) before DB abuse — no change to topology required.

---

**Identity reminder:** Primary external identity is **wallet address**; `users.id` is internal; **JWT** is the active session. IP is only used for throttling, not identification.
