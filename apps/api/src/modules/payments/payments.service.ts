import { createHash, randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { CreditPack, Payment } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { resolveChainConfig } from './chain.config';

export interface PackDto {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  usdcAmount: string;
  credits: number;
  sortOrder: number;
}

export interface CreatePaymentInput {
  userId: string;
  packCode: string;
}

export interface CreatePaymentResult {
  paymentRef: string;
  packCode: string;
  receivingAddress: string;
  /** Atomic USDC units (string to avoid bigint JSON loss). The user must send
   * exactly this amount; the watcher matches `(receivingAddress, amount)` to
   * find the pending Payment row. */
  expectedAmountAtomic: string;
  /** Same amount expressed as a human-readable USDC string (e.g. "5.001234"). */
  expectedAmountUsdc: string;
  chain: 'base' | 'baseSepolia';
  chainId: number;
  usdcAddress: string;
  expiresAt: string;
  status: 'pending';
}

export interface PaymentStatusResult {
  paymentRef: string;
  status: 'pending' | 'confirmed' | 'expired' | 'failed';
  confirmedAt: string | null;
  txHash: string | null;
  blockNumber: string | null;
  receivingAddress: string;
  expectedAmountAtomic: string;
  expectedAmountUsdc: string;
  expiresAt: string;
  pack: { code: string; credits: number };
  /** Convenience for the polling UI — `true` means stop polling. */
  terminal: boolean;
}

/**
 * Phase 2 payments — catalogue lookup, payment-intent creation (with amount
 * nudge for uniqueness), and status polling. The actual on-chain confirmation
 * happens in `PaymentWatcherService`; this service is purely the request/
 * response side.
 */
@Injectable()
export class PaymentsService implements OnModuleInit {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mainnet safety guard. We refuse to boot the API when the operator has
   * flipped `PHASE2_CHAIN=base` (real money) but forgot to set the receiving
   * address. The error must be loud and synchronous so the orchestrator
   * (docker compose) restart-loops and surfaces it in `docker logs`, instead
   * of silently accepting payments that nobody can sweep. Testnet boots
   * fine so dev/staging stays self-contained.
   */
  onModuleInit(): void {
    const chain = resolveChainConfig();
    if (chain.name === 'base' && !this.receivingAddress) {
      const msg =
        'PHASE2_CHAIN=base but PHASE2_RECEIVING_ADDRESS is unset or invalid. ' +
        'Refusing to start payments on mainnet without a treasury address.';
      this.logger.error(msg);
      throw new Error(msg);
    }
    this.logger.log(
      `Payments armed: chain=${chain.name} receiving=${this.receivingAddress ?? '(unset — testnet only)'} maxPackUsdc=${this.maxPackUsdc} ttl=${this.paymentTtlSeconds}s`,
    );
  }

  // ------------- env-derived knobs -------------------------------------------

  private get receivingAddress(): `0x${string}` | null {
    const raw = process.env.PHASE2_RECEIVING_ADDRESS?.trim().toLowerCase();
    if (!raw || !/^0x[0-9a-f]{40}$/.test(raw)) return null;
    return raw as `0x${string}`;
  }

  private get paymentTtlSeconds(): number {
    const raw = Number(process.env.PHASE2_PAYMENT_TTL_SECONDS ?? 1800);
    if (!Number.isFinite(raw) || raw < 60 || raw > 24 * 3600) return 1800;
    return raw;
  }

  private get nudgeBits(): number {
    const raw = Number(process.env.PHASE2_AMOUNT_NUDGE_BITS ?? 14);
    if (!Number.isFinite(raw) || raw < 8 || raw > 20) return 14;
    return raw;
  }

  private get maxPackUsdc(): number {
    const raw = Number(process.env.PHASE2_MAX_PACK_USDC ?? 100);
    if (!Number.isFinite(raw) || raw < 1) return 100;
    return raw;
  }

  // ------------- public API --------------------------------------------------

  health() {
    const chain = resolveChainConfig();
    const recv = this.receivingAddress;
    return {
      ready: !!recv,
      chain: chain.name,
      chainId: chain.id,
      usdcAddress: chain.usdcAddress,
      receivingAddress: recv,
      paymentTtlSeconds: this.paymentTtlSeconds,
      maxPackUsdc: this.maxPackUsdc,
    };
  }

  async listPacks(): Promise<PackDto[]> {
    const rows = await this.prisma.creditPack.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    });
    return rows.map((p) => ({
      id: p.id,
      code: p.code,
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      usdcAmount: p.usdcAmount.toString(),
      credits: p.credits,
      sortOrder: p.sortOrder,
    }));
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const recv = this.receivingAddress;
    if (!recv) {
      throw new ServiceUnavailableException(
        'Payments are not configured (PHASE2_RECEIVING_ADDRESS is unset)',
      );
    }
    const pack = await this.prisma.creditPack.findUnique({
      where: { code: input.packCode },
    });
    if (!pack || !pack.active) {
      throw new NotFoundException(`Unknown or inactive pack: ${input.packCode}`);
    }
    const baseAmountAtomic = packBaseAmountAtomic(pack);
    const cap = BigInt(Math.floor(this.maxPackUsdc * 1_000_000));
    if (baseAmountAtomic > cap) {
      throw new ForbiddenException(
        `Pack price ${pack.usdcAmount} USDC exceeds PHASE2_MAX_PACK_USDC=${this.maxPackUsdc}`,
      );
    }

    // Pick a unique amount nudge by trial — collisions are extremely unlikely
    // given our nudge space, but we retry deterministically just in case.
    const expiresAt = new Date(Date.now() + this.paymentTtlSeconds * 1000);
    const nudgeMod = 1 << this.nudgeBits; // e.g. 2^14 = 16384

    for (let attempt = 0; attempt < 8; attempt++) {
      const seed = randomBytes(8).toString('hex');
      const nudge = BigInt(
        parseInt(createHash('sha256').update(seed).digest('hex').slice(0, 8), 16) %
          nudgeMod,
      );
      const expectedAmount = baseAmountAtomic + nudge;
      try {
        const created = await this.prisma.payment.create({
          data: {
            userId: input.userId,
            packId: pack.id,
            receivingAddress: recv,
            expectedAmountAtomic: expectedAmount,
            expiresAt,
          },
        });
        return this.serializeCreate(created, pack, expectedAmount);
      } catch (e) {
        const code = (e as { code?: string }).code;
        if (code === 'P2002') {
          // Another pending payment already owns this exact amount; try a
          // different nudge.
          continue;
        }
        throw e;
      }
    }
    throw new ServiceUnavailableException(
      'Could not allocate a unique payment amount; please retry shortly',
    );
  }

  async getStatusByRef(paymentRef: string): Promise<PaymentStatusResult> {
    const row = await this.prisma.payment.findUnique({
      where: { paymentRef },
      include: { pack: true },
    });
    if (!row) throw new NotFoundException('Payment not found');

    // Lazy-expire pending payments past their TTL.
    if (row.status === 'pending' && row.expiresAt.getTime() < Date.now()) {
      await this.prisma.payment.update({
        where: { id: row.id },
        data: { status: 'expired' },
      });
      row.status = 'expired';
    }
    return this.serializeStatus(row, row.pack);
  }

  // ------------- helpers -----------------------------------------------------

  private serializeCreate(
    p: Payment,
    pack: CreditPack,
    expectedAtomic: bigint,
  ): CreatePaymentResult {
    const chain = resolveChainConfig();
    return {
      paymentRef: p.paymentRef,
      packCode: pack.code,
      receivingAddress: p.receivingAddress,
      expectedAmountAtomic: expectedAtomic.toString(),
      expectedAmountUsdc: atomicToUsdcString(expectedAtomic),
      chain: chain.name,
      chainId: chain.id,
      usdcAddress: chain.usdcAddress,
      expiresAt: p.expiresAt.toISOString(),
      status: 'pending',
    };
  }

  private serializeStatus(p: Payment, pack: CreditPack): PaymentStatusResult {
    const terminal =
      p.status === 'confirmed' || p.status === 'expired' || p.status === 'failed';
    return {
      paymentRef: p.paymentRef,
      status: p.status,
      confirmedAt: p.confirmedAt?.toISOString() ?? null,
      txHash: p.txHash,
      blockNumber: p.blockNumber?.toString() ?? null,
      receivingAddress: p.receivingAddress,
      expectedAmountAtomic: p.expectedAmountAtomic.toString(),
      expectedAmountUsdc: atomicToUsdcString(p.expectedAmountAtomic),
      expiresAt: p.expiresAt.toISOString(),
      pack: { code: pack.code, credits: pack.credits },
      terminal,
    };
  }
}

// --- pure helpers (exported for tests) ---------------------------------------

/**
 * USDC has 6 decimals; converts a `Decimal` pack price to atomic units. Uses
 * string math to avoid floating-point drift on values like 4.99 → 4990000.
 */
export function packBaseAmountAtomic(pack: { usdcAmount: { toString(): string } }): bigint {
  const s = pack.usdcAmount.toString();
  if (!/^\d+(?:\.\d{0,6})?$/.test(s)) {
    throw new BadRequestException(`Pack usdcAmount has invalid precision: ${s}`);
  }
  const [whole, frac = ''] = s.split('.');
  const padded = (frac + '000000').slice(0, 6);
  return BigInt(whole) * 1_000_000n + BigInt(padded);
}

export function atomicToUsdcString(atomic: bigint): string {
  const sign = atomic < 0n ? '-' : '';
  const v = atomic < 0n ? -atomic : atomic;
  const whole = v / 1_000_000n;
  const frac = v % 1_000_000n;
  const fracStr = frac.toString().padStart(6, '0').replace(/0+$/, '');
  return fracStr.length > 0 ? `${sign}${whole}.${fracStr}` : `${sign}${whole}`;
}
