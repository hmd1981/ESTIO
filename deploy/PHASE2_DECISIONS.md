# Phase 2 — operator decisions before money flows

Phase 2 adds real money paths (USDC on Base) and a real user identity (SIWE).
The code is written so every behaviour-affecting choice is an env var with a
**safe default** — but a handful of these defaults are deliberately
testnet-first or zero-amount, and you must flip them explicitly before going
live to mainnet. This doc lists every such knob and the recommended value for
each environment.

| Env var                            | Default (committed)              | Mainnet value (when ready)             | Why it matters                                                                          |
|------------------------------------|----------------------------------|----------------------------------------|------------------------------------------------------------------------------------------|
| `PHASE2_CHAIN`                     | `baseSepolia`                    | `base`                                 | Chooses chain id (84532 vs 8453) and USDC contract. Defaults to **testnet** so a fresh deploy cannot accidentally touch real money. |
| `PHASE2_RPC_URL`                   | (chain default public RPC)       | Alchemy / QuickNode / Infura URL       | Public Base RPCs are rate-limited and occasionally drop logs. Use a paid provider in mainnet, otherwise the watcher may miss confirmations. |
| `PHASE2_RECEIVING_ADDRESS`         | *(unset → endpoints return 503)* | Your treasury multisig address (cold)  | All USDC payments are sent here. Strongly recommend a Safe / multisig, NOT an EOA you also use for testing. The PaymentsModule refuses to start if this is unset and `PHASE2_CHAIN=base`. |
| `PHASE2_RECEIVING_ADDRESS_ALLOWLIST` | *(unset → equals receiving)*   | Comma-separated list of valid addrs    | Defence in depth: the watcher only credits if the destination address is in this allowlist. Lets you rotate receiving addresses without a code change while still rejecting unrelated transfers. |
| `PHASE2_PAYMENT_TTL_SECONDS`       | `1800` (30 min)                  | `1800`                                 | A `pending` payment expires after this; the user must restart from `/payments/create`. |
| `PHASE2_MIN_CONFIRMATIONS`         | `2`                              | `2`                                    | Number of Base blocks (≈4s on mainnet) before a transfer is treated as final. |
| `PHASE2_MAX_CURSOR_LAG_BLOCKS`     | `50000` (~28h on Base)           | `50000`                                | Hard cap on the watcher's scan backlog. After extended downtime, the watcher refuses to crawl ancient blocks (so old transfers can never silently match new payment intents) and emits a loud log instead. Operator fast-forwards the cursor manually after reconciling. Set `0` to disable (not recommended).  |
| `PHASE2_MAX_PACK_USDC`             | `100`                            | `100` or higher                        | Hard cap on a single credit-pack price. The PaymentsModule refuses to create packs above this. Prevents a CMS misconfiguration from selling a $10 000 pack by accident. |
| `PHASE2_AMOUNT_NUDGE_BITS`         | `14`                             | `14`                                   | Per-payment amount disambiguation: `0..16383` extra atomic USDC units (i.e. up to 0.016383 USDC, ≈ $0.016) added to each invoice so two simultaneous pending payments can't both match the same incoming transfer. Don't lower this without re-checking pack pricing collisions. |
| `PHASE2_SIWE_DOMAIN`               | `estio.org`                      | `estio.org`                            | Used in the SIWE message and the JWT `aud` claim; mismatched domain rejects the signature. |
| `PHASE2_SIWE_NONCE_TTL_SECONDS`    | `600` (10 min)                   | `600`                                  | A nonce is single-use AND expires after this; replay protection. |
| `JWT_SECRET`                       | (existing — admin login uses it) | rotate, separate from admin if possible | Reused for the user wallet JWT. Sub claim is the lowercase wallet address; `kind: 'wallet'` claim distinguishes it from admin JWTs. If you ever need to invalidate all sessions, rotate this. |

## Key design choices (already encoded in code)

1. **Single shared receiving address with per-payment amount nudge.** Avoids
   per-user HD derivation complexity and the operational pain of sweeping many
   addresses. The 14-bit nudge means each pending invoice has a unique
   USDC-atomic amount; the watcher matches `(receiving address, amount, recent
   block range)` to a unique pending row. Tradeoff: max ~16 384 distinct
   simultaneous pending payments per pack-price; way more than we expect.

2. **Watcher is pull-based (RPC `eth_getLogs`), not push-based (websocket).**
   Easier to operate, no reconnect dance, no WebSocket provider lock-in. Polls
   every `PHASE2_WATCHER_POLL_MS` (default 12 000 ms — Base block time is ~2 s
   so we sweep ~6 blocks per cycle). Catches up from `lastScannedBlock`
   persisted in the DB.

3. **Credits ledger is double-entry-friendly.** Every row has a `delta` (signed
   int), a `reason`, an optional `refType` + `refId` (e.g. `'payment'`+paymentId,
   `'job'`+jobId), and a `balanceAfter`. Balance is `sum(delta)` over the
   user's rows; the `balanceAfter` column is purely a denormalized convenience
   for fast last-row reads and audits. Idempotency: the (`refType`, `refId`)
   pair is unique-indexed, so a payment-confirmation watcher rerun, or a job
   submit retry that re-uses the same jobId, can never double-credit or
   double-debit.

4. **Job submit debits in the same Prisma transaction as the job-row insert.**
   A failure on either side rolls back both. If the job ends up in a terminal
   `failed` state (worker rejected it permanently), `MediaJobsService` writes a
   refund row keyed on the same jobId with reason `refund` so the user gets
   their credits back.

5. **SIWE chain = same as USDC chain.** This isn't a hard requirement of SIWE
   (the message can name any chain id), but using the same chain means the
   user's wallet doesn't need to switch networks between login and payment.

6. **Mainnet boot guard.** `PaymentsService.onModuleInit` refuses to start the
   API when `PHASE2_CHAIN=base` and `PHASE2_RECEIVING_ADDRESS` is unset or
   invalid. The error is synchronous and surfaced in `docker logs` so an
   operator can never accidentally bring up a mainnet API that can't sweep
   funds. Testnet (`baseSepolia`, the default) boots fine without the address
   so dev/staging stays self-contained.

7. **Audit log on every ledger write.** `CreditsService.append` emits a
   structured `LEDGER user=… delta=… reason=… ref=…:… balanceAfter=… rowId=…`
   line on every successful insert. The CreditLedger table itself is the
   immutable source of truth; this log is the operator-friendly mirror so
   you can `journalctl … | rg LEDGER` for any user/refId during incident
   review.

## Ops checklist before flipping `PHASE2_CHAIN=base`

- [ ] Treasury multisig address deployed on Base mainnet. Tested by sending a
      $1 USDC transfer from a separate wallet and confirming it shows up in the
      multisig UI.
- [ ] `PHASE2_RECEIVING_ADDRESS` set to the multisig address. Verified by
      `curl https://api.estio.org/payments/health` (returns `{ ready: true,
      receivingAddress: "0x…", chain: "base" }`).
- [ ] `PHASE2_RECEIVING_ADDRESS_ALLOWLIST` set to the receiving address (and
      any planned rotation targets).
- [ ] At least one `CreditPack` row inserted via the admin API or a seed
      script, with `active: true` and a sane `usdcAmount`.
- [ ] Paid RPC provider URL set in `PHASE2_RPC_URL`; quota verified for
      `eth_getLogs` at `~600 calls / hour` baseline + spikes.
- [ ] End-to-end test on Base **Sepolia** first: SIWE login from a real wallet,
      pay $0.01 from a Sepolia USDC faucet, confirm credits show up in the
      ledger within ~30s, generate one image, refund a deliberately failed job.
- [ ] Backups verified on VM902 (the ledger is the source of truth for who is
      owed what).
