import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  createPublicClient,
  http,
  parseAbiItem,
  type PublicClient,
} from 'viem';
import { PrismaService } from '../../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';
import { resolveChainConfig } from './chain.config';

const TRANSFER_EVENT = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 value)',
);

/**
 * Polls the configured Base RPC for USDC `Transfer` events targeting our
 * receiving address(es), matches them against `pending` Payment rows by
 * `(receivingAddress, expectedAmountAtomic)`, and atomically:
 *
 *   1. updates the Payment row with txHash / blockNumber / status='confirmed'
 *   2. appends a `payment_credit` row to the user's CreditLedger
 *
 * Both writes happen in one Prisma transaction so a partial-credit ghost can't
 * exist. Idempotency is enforced by the `(refType,refId,reason)` unique index
 * on CreditLedger AND by the Payment row going from `pending` to `confirmed`
 * (a re-scan of the same block reuses the same row, which already exists).
 *
 * The watcher persists its progress in `PaymentWatcherCursor` so a restart
 * never re-credits already-credited transfers and never silently skips a
 * block range.
 *
 * Disabled (no-op) until `PHASE2_RECEIVING_ADDRESS` is set, so a fresh deploy
 * won't crash or spam the RPC.
 */
@Injectable()
export class PaymentWatcherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PaymentWatcherService.name);
  private client: PublicClient | null = null;
  private timer: NodeJS.Timeout | null = null;
  private running = false;
  private stopping = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly credits: CreditsService,
  ) {}

  // ------------- env-derived knobs ------------------------------------------

  private get pollMs(): number {
    const raw = Number(process.env.PHASE2_WATCHER_POLL_MS ?? 12_000);
    if (!Number.isFinite(raw) || raw < 2_000 || raw > 5 * 60_000) return 12_000;
    return raw;
  }

  private get minConfirmations(): bigint {
    const raw = Number(process.env.PHASE2_MIN_CONFIRMATIONS ?? 2);
    if (!Number.isFinite(raw) || raw < 0 || raw > 50) return 2n;
    return BigInt(Math.floor(raw));
  }

  /**
   * Hard cap (in blocks) on how far behind tip the watcher cursor is allowed
   * to drift before we stop scanning and demand operator attention.
   *
   * Why this matters: if the API is offline for days and then restarted, a
   * naive replay would crawl thousands of blocks at startup, hammering the
   * RPC quota and credit-confirming payments whose intents long expired.
   * Because the per-payment amount nudge guarantees no old transfer can
   * silently match a current pending row, the safe behaviour on a huge gap
   * is to refuse to scan and emit a loud log; an operator can then decide
   * whether to fast-forward the cursor or do manual reconciliation.
   *
   * Default 50 000 blocks ≈ 28h on Base mainnet (2s blocks). Override via
   * `PHASE2_MAX_CURSOR_LAG_BLOCKS=0` to disable (not recommended).
   */
  private get maxCursorLagBlocks(): bigint {
    const raw = Number(process.env.PHASE2_MAX_CURSOR_LAG_BLOCKS ?? 50_000);
    if (!Number.isFinite(raw) || raw < 0) return 50_000n;
    return BigInt(Math.floor(raw));
  }

  private get allowlist(): Set<string> {
    const recv = (process.env.PHASE2_RECEIVING_ADDRESS ?? '')
      .trim()
      .toLowerCase();
    const extra = (process.env.PHASE2_RECEIVING_ADDRESS_ALLOWLIST ?? '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => /^0x[0-9a-f]{40}$/.test(s));
    const set = new Set<string>(extra);
    if (/^0x[0-9a-f]{40}$/.test(recv)) set.add(recv);
    return set;
  }

  // ------------- lifecycle ---------------------------------------------------

  onModuleInit() {
    if (this.allowlist.size === 0) {
      this.logger.log(
        'PaymentWatcher disabled (PHASE2_RECEIVING_ADDRESS unset); skipping RPC polling',
      );
      return;
    }
    const chain = resolveChainConfig();
    this.client = createPublicClient({
      chain: chain.chain,
      transport: http(chain.rpcUrl),
    });
    this.logger.log(
      `PaymentWatcher armed: chain=${chain.name} usdc=${chain.usdcAddress} receivers=${[...this.allowlist].join(',')}`,
    );
    this.scheduleNext(2_000); // small initial delay so the rest of the app boots
  }

  async onModuleDestroy() {
    this.stopping = true;
    if (this.timer) clearTimeout(this.timer);
    // Wait briefly for an in-flight tick to finish so we don't write half a
    // batch into the DB on shutdown.
    for (let i = 0; this.running && i < 30; i++) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  // ------------- main loop ---------------------------------------------------

  private scheduleNext(delayMs = this.pollMs) {
    if (this.stopping || !this.client) return;
    this.timer = setTimeout(() => {
      void this.tick();
    }, delayMs);
  }

  private async tick() {
    if (this.stopping || !this.client) return;
    this.running = true;
    try {
      await this.scanOnce();
    } catch (e) {
      this.logger.warn(`PaymentWatcher tick failed: ${(e as Error).message}`);
    } finally {
      this.running = false;
      this.scheduleNext();
    }
  }

  private async scanOnce(): Promise<void> {
    if (!this.client) return;
    const chain = resolveChainConfig();

    // Flip stale intents without requiring a status poll — keeps pending rows
    // from matching on-chain after the TTL and aligns DB state with UX.
    const expired = await this.prisma.payment.updateMany({
      where: {
        status: 'pending',
        expiresAt: { lt: new Date() },
      },
      data: { status: 'expired' },
    });
    if (expired.count > 0) {
      this.logger.log(
        `Marked ${expired.count} payment(s) as expired (past expiresAt)`,
      );
    }

    const tip = await this.client.getBlockNumber();
    const safeTip = tip - this.minConfirmations;
    if (safeTip < 0n) return;

    const cursor = await this.prisma.paymentWatcherCursor.upsert({
      where: { chainId: chain.id },
      update: {},
      create: { chainId: chain.id, lastScannedBlock: safeTip - 1n },
    });
    const fromBlock = cursor.lastScannedBlock + 1n;
    if (fromBlock > safeTip) return;

    // Refuse to crawl an absurd backlog after extended downtime — see comment
    // on `maxCursorLagBlocks`. The operator must explicitly fast-forward
    // the cursor before scanning resumes.
    const lag = safeTip - cursor.lastScannedBlock;
    const maxLag = this.maxCursorLagBlocks;
    if (maxLag > 0n && lag > maxLag) {
      this.logger.error(
        `PaymentWatcher cursor is ${lag} blocks behind tip on chain=${chain.name} ` +
          `(>${maxLag}). Refusing to scan to avoid replaying ancient state. ` +
          `Reconcile manually, then UPDATE payment_watcher_cursor SET last_scanned_block=<recent block>.`,
      );
      return;
    }

    // Cap each pass to a manageable window so a backlog can't OOM us by
    // pulling thousands of logs at once.
    const MAX_RANGE = 500n;
    const toBlock =
      fromBlock + MAX_RANGE > safeTip ? safeTip : fromBlock + MAX_RANGE;

    const recipients = [...this.allowlist].map((s) => s as `0x${string}`);
    const logs = await this.client.getLogs({
      address: chain.usdcAddress,
      event: TRANSFER_EVENT,
      args: { to: recipients },
      fromBlock,
      toBlock,
    });

    for (const log of logs) {
      const to = log.args.to?.toLowerCase();
      const value = log.args.value;
      const txHash = log.transactionHash;
      const blockNumber = log.blockNumber;
      if (!to || value == null || !txHash || blockNumber == null) continue;

      // Find a matching pending Payment row.
      const candidate = await this.prisma.payment.findFirst({
        where: {
          receivingAddress: to,
          expectedAmountAtomic: value,
          status: 'pending',
          expiresAt: { gt: new Date() },
        },
      });
      if (!candidate) {
        // Could be a real transfer to our treasury that isn't from a Pay
        // flow — log and move on. Operators can reconcile manually.
        this.logger.warn(
          `Unmatched USDC transfer to=${to} value=${value} tx=${txHash} block=${blockNumber}`,
        );
        continue;
      }

      const pack = await this.prisma.creditPack.findUnique({
        where: { id: candidate.packId },
      });
      if (!pack) {
        this.logger.error(
          `Payment ${candidate.id} references missing pack ${candidate.packId}`,
        );
        continue;
      }

      try {
        await this.prisma.$transaction(async (tx) => {
          // Step 1: flip the Payment row in a way that's idempotent — only one
          // updateMany succeeds even under concurrent watcher runs.
          const flipped = await tx.payment.updateMany({
            where: { id: candidate.id, status: 'pending' },
            data: {
              status: 'confirmed',
              txHash,
              fromAddress: log.args.from?.toLowerCase() ?? null,
              blockNumber,
              confirmedAt: new Date(),
            },
          });
          if (flipped.count !== 1) {
            // Already confirmed by a sibling sweep; skip the ledger write —
            // the unique index on the ledger would also catch it, but no
            // need to spend the round-trip.
            return;
          }
          await this.credits.creditForPayment(
            {
              userId: candidate.userId,
              paymentId: candidate.id,
              amount: pack.credits,
            },
            tx,
          );
        });
        this.logger.log(
          `Confirmed payment ${candidate.paymentRef}: +${pack.credits} credits to user ${candidate.userId} (tx=${txHash})`,
        );
      } catch (e) {
        this.logger.error(
          `Failed to confirm payment ${candidate.id} from tx ${txHash}: ${(e as Error).message}`,
        );
      }
    }

    await this.prisma.paymentWatcherCursor.update({
      where: { chainId: chain.id },
      data: { lastScannedBlock: toBlock },
    });
  }
}
