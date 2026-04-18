-- Phase 2 — wallet auth (SIWE), credit packs, on-chain USDC payments, ledger.
-- See deploy/PHASE2_DECISIONS.md for the env knobs and design rationale.

-- =============================================================================
-- Enums
-- =============================================================================

CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'confirmed', 'expired', 'failed');

CREATE TYPE "CreditLedgerReason" AS ENUM (
    'payment_credit',
    'job_debit',
    'refund',
    'manual_adjust'
);

-- =============================================================================
-- users — end-user identity, keyed by lowercased 0x wallet address.
-- =============================================================================

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "walletAddress" VARCHAR(64) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_walletAddress_key" ON "users"("walletAddress");

-- =============================================================================
-- siwe_nonces — single-use SIWE login nonces with TTL.
-- =============================================================================

CREATE TABLE "siwe_nonces" (
    "id" TEXT NOT NULL,
    "nonce" VARCHAR(64) NOT NULL,
    "walletAddress" VARCHAR(64),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),

    CONSTRAINT "siwe_nonces_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "siwe_nonces_nonce_key" ON "siwe_nonces"("nonce");
CREATE INDEX "siwe_nonces_expiresAt_idx" ON "siwe_nonces"("expiresAt");

-- =============================================================================
-- credit_packs — catalogue of buyable packs.
-- =============================================================================

CREATE TABLE "credit_packs" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "nameEn" VARCHAR(80) NOT NULL,
    "nameAr" VARCHAR(80) NOT NULL,
    "usdcAmount" DECIMAL(20, 6) NOT NULL,
    "credits" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_packs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "credit_packs_code_key" ON "credit_packs"("code");

-- =============================================================================
-- payments — one pending or confirmed on-chain USDC payment.
-- =============================================================================

CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "paymentRef" VARCHAR(64) NOT NULL,
    "userId" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "receivingAddress" VARCHAR(64) NOT NULL,
    "expectedAmountAtomic" BIGINT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "txHash" VARCHAR(80),
    "fromAddress" VARCHAR(64),
    "blockNumber" BIGINT,
    "confirmedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payments_paymentRef_key" ON "payments"("paymentRef");
CREATE INDEX "payments_userId_createdAt_idx" ON "payments"("userId", "createdAt");
CREATE INDEX "payments_status_expiresAt_idx" ON "payments"("status", "expiresAt");
CREATE INDEX "payments_receivingAddress_expectedAmountAtomic_status_idx"
    ON "payments"("receivingAddress", "expectedAmountAtomic", "status");
CREATE UNIQUE INDEX "payments_addr_amount_status_uniq"
    ON "payments"("receivingAddress", "expectedAmountAtomic", "status");

ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_packId_fkey"
    FOREIGN KEY ("packId") REFERENCES "credit_packs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =============================================================================
-- credit_ledger — append-only ledger; balance = sum(delta) per user.
-- =============================================================================

CREATE TABLE "credit_ledger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" "CreditLedgerReason" NOT NULL,
    "refType" VARCHAR(40) NOT NULL,
    "refId" VARCHAR(80) NOT NULL,
    "balanceAfter" INTEGER NOT NULL,
    "notes" VARCHAR(280),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_ledger_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "credit_ledger_userId_createdAt_idx" ON "credit_ledger"("userId", "createdAt");
CREATE UNIQUE INDEX "credit_ledger_ref_reason_uniq"
    ON "credit_ledger"("refType", "refId", "reason");

ALTER TABLE "credit_ledger" ADD CONSTRAINT "credit_ledger_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =============================================================================
-- payment_watcher_cursor — singleton-per-chain progress marker.
-- =============================================================================

CREATE TABLE "payment_watcher_cursor" (
    "chainId" INTEGER NOT NULL,
    "lastScannedBlock" BIGINT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_watcher_cursor_pkey" PRIMARY KEY ("chainId")
);
