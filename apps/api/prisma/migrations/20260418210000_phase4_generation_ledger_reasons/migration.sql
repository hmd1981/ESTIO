-- Phase 4 — generation credit reasons (debit/refund/reservation family).
-- Existing rows keep job_debit/refund; new writes use generation_*.

ALTER TYPE "CreditLedgerReason" ADD VALUE IF NOT EXISTS 'generation_debit';
ALTER TYPE "CreditLedgerReason" ADD VALUE IF NOT EXISTS 'generation_refund';
ALTER TYPE "CreditLedgerReason" ADD VALUE IF NOT EXISTS 'generation_reservation';
ALTER TYPE "CreditLedgerReason" ADD VALUE IF NOT EXISTS 'generation_reservation_release';
