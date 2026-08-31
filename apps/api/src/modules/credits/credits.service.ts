import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { Prisma, PrismaClient, CreditLedgerReason } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type LedgerEntryDto = {
  id: string;
  delta: number;
  reason: string;
  refType: string;
  refId: string;
  balanceAfter: number;
  notes: string | null;
  createdAt: string;
};

export type LedgerPageDto = {
  items: LedgerEntryDto[];
  nextCursor: string | null;
};

/**
 * Append-only credit ledger.
 *
 * - Every credit-affecting action becomes one row in `credit_ledger`.
 * - The user's balance is `sum(delta)` for that user; we also keep a
 *   denormalized `balanceAfter` per row for fast last-row reads and for
 *   audit ("what did the user see at this point").
 * - Idempotency: every row carries `(refType, refId, reason)`, which is
 *   uniquely indexed. Re-running the same payment-credit, the same
 *   job-debit, or the same refund is a no-op (we surface the existing row
 *   instead of double-applying).
 *
 * The `tx` parameter on every method accepts either the global PrismaService
 * or a transaction client — callers that need atomicity with a sibling write
 * (e.g. job submit creates the MediaGenerationJob row AND the debit row in
 * one transaction) pass the transaction client they already opened.
 */
@Injectable()
export class CreditsService {
  private readonly logger = new Logger(CreditsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Sum of all ledger entries for a user. Cheap because of the (userId,
   * createdAt) index. */
  async getBalance(
    userId: string,
    tx?: Prisma.TransactionClient,
  ): Promise<number> {
    const db = (tx ?? this.prisma) as PrismaClient;
    const agg = await db.creditLedger.aggregate({
      where: { userId },
      _sum: { delta: true },
    });
    return agg._sum.delta ?? 0;
  }

  /**
   * Newest-first ledger page for the authenticated user. `cursor` is the
   * `id` of the last item from the previous page (validated to belong to
   * this user so clients cannot page into another account).
   */
  async listLedger(
    userId: string,
    opts: { limit: number; cursor?: string | null },
  ): Promise<LedgerPageDto> {
    const take = Math.min(100, Math.max(1, opts.limit));
    if (opts.cursor) {
      const ok = await this.prisma.creditLedger.findFirst({
        where: { id: opts.cursor, userId },
        select: { id: true },
      });
      if (!ok) {
        throw new BadRequestException('Invalid or stale pagination cursor');
      }
    }
    const rows = await this.prisma.creditLedger.findMany({
      where: { userId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: take + 1,
      ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
      select: {
        id: true,
        delta: true,
        reason: true,
        refType: true,
        refId: true,
        balanceAfter: true,
        notes: true,
        createdAt: true,
      },
    });
    const hasMore = rows.length > take;
    const page = hasMore ? rows.slice(0, take) : rows;
    const last = page[page.length - 1];
    return {
      items: page.map(
        (r: {
          id: string;
          delta: number;
          reason: string;
          refType: string;
          refId: string;
          balanceAfter: number;
          notes: string | null;
          createdAt: Date;
        }) => ({
          id: r.id,
          delta: r.delta,
          reason: r.reason,
          refType: r.refType,
          refId: r.refId,
          balanceAfter: r.balanceAfter,
          notes: r.notes,
          createdAt: r.createdAt.toISOString(),
        }),
      ),
      nextCursor: hasMore && last ? last.id : null,
    };
  }

  /**
   * Append a ledger entry. The `(refType, refId, reason)` triple is the
   * idempotency key — a duplicate insert is caught by the unique index, and
   * we surface the existing row instead of throwing. Returns `{ created,
   * row }` so callers can decide whether to do follow-up work.
   */
  async append(
    args: {
      userId: string;
      delta: number;
      reason: CreditLedgerReason;
      refType: string;
      refId: string;
      notes?: string;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<{ created: boolean; balanceAfter: number; rowId: string }> {
    const db = (tx ?? this.prisma) as PrismaClient;

    // Fast existence check — covered by the unique index, no need to lock.
    const existing = await db.creditLedger.findFirst({
      where: { refType: args.refType, refId: args.refId, reason: args.reason },
      select: { id: true, balanceAfter: true },
    });
    if (existing) {
      return {
        created: false,
        balanceAfter: existing.balanceAfter,
        rowId: existing.id,
      };
    }

    // For an atomic balanceAfter we need to read the current balance and
    // insert in the same transaction. If the caller didn't open one, open
    // a small one ourselves.
    if (!tx) {
      return this.prisma.$transaction(async (innerTx) => {
        return this.append(args, innerTx);
      });
    }

    const current = await this.getBalance(args.userId, tx);
    const next = current + args.delta;
    if (args.delta < 0 && next < 0) {
      const requiredCredits = -args.delta;
      const shortfall = requiredCredits - current;
      throw new HttpException(
        {
          statusCode: HttpStatus.PAYMENT_REQUIRED,
          error: 'Payment Required',
          code: 'INSUFFICIENT_CREDITS',
          message: 'Insufficient credit balance',
          balance: current,
          requiredCredits,
          shortfall,
          attemptedDelta: args.delta,
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    try {
      const row = await db.creditLedger.create({
        data: {
          userId: args.userId,
          delta: args.delta,
          reason: args.reason,
          refType: args.refType,
          refId: args.refId,
          balanceAfter: next,
          notes: args.notes,
        },
        select: { id: true },
      });
      // Structured audit line — keep all credit movements greppable in
      // journalctl / Loki. Format chosen so a one-liner regex can extract
      // every event for a given user or refId during incident review.
      this.logger.log(
        `LEDGER user=${args.userId} delta=${args.delta} reason=${args.reason} ref=${args.refType}:${args.refId} balanceAfter=${next} rowId=${row.id}`,
      );
      return { created: true, balanceAfter: next, rowId: row.id };
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code === 'P2002') {
        // Race: another transaction inserted the same (refType, refId, reason)
        // between our findFirst and our create. Re-read and surface that row.
        const winner = await db.creditLedger.findFirst({
          where: {
            refType: args.refType,
            refId: args.refId,
            reason: args.reason,
          },
          select: { id: true, balanceAfter: true },
        });
        if (winner) {
          return {
            created: false,
            balanceAfter: winner.balanceAfter,
            rowId: winner.id,
          };
        }
        throw new ConflictException('Ledger uniqueness conflict');
      }
      throw e;
    }
  }

  /** Convenience — debit `amount` (positive) credits for a generation job submit. */
  debitForJob(
    args: { userId: string; jobId: string; amount: number },
    tx?: Prisma.TransactionClient,
  ) {
    if (args.amount <= 0) {
      throw new Error('debitForJob requires a positive amount');
    }
    return this.append(
      {
        userId: args.userId,
        delta: -args.amount,
        reason: 'generation_debit',
        refType: 'job',
        refId: args.jobId,
        notes: `generation_submit:${args.jobId}`,
      },
      tx,
    );
  }

  /** Convenience — credit a confirmed payment. */
  creditForPayment(
    args: { userId: string; paymentId: string; amount: number },
    tx?: Prisma.TransactionClient,
  ) {
    if (args.amount <= 0) {
      throw new Error('creditForPayment requires a positive amount');
    }
    return this.append(
      {
        userId: args.userId,
        delta: args.amount,
        reason: 'payment_credit',
        refType: 'payment',
        refId: args.paymentId,
        notes: `payment:${args.paymentId}`,
      },
      tx,
    );
  }

  /**
   * Refund a previously debited generation job (terminal failure). Idempotent
   * via `(refType, refId, reason)` and compatible with legacy `refund` rows.
   */
  async refundJob(
    args: { userId: string; jobId: string; amount: number },
    tx?: Prisma.TransactionClient,
  ): Promise<{ created: boolean; balanceAfter: number; rowId: string }> {
    if (args.amount <= 0) {
      throw new Error('refundJob requires a positive amount');
    }
    const db = (tx ?? this.prisma) as PrismaClient;
    const refId = `${args.jobId}:refund`;
    const existing = await db.creditLedger.findFirst({
      where: {
        refType: 'job',
        refId,
        reason: { in: ['refund', 'generation_refund'] },
      },
      select: { id: true, balanceAfter: true },
    });
    if (existing) {
      return {
        created: false,
        balanceAfter: existing.balanceAfter,
        rowId: existing.id,
      };
    }
    return this.append(
      {
        userId: args.userId,
        delta: args.amount,
        reason: 'generation_refund',
        refType: 'job',
        refId,
        notes: `generation_refund:${args.jobId}`,
      },
      tx,
    );
  }
}
