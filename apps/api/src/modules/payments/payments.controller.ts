import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { WalletAuthGuard } from '../wallet-auth/wallet-auth.guard';
import { PaymentsService } from './payments.service';

interface CreatePaymentBody {
  packCode?: string;
}

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  /** Public — used by the marketing/Studio UI to render the pack picker. */
  @Get('packs')
  @Throttle({
    short: { limit: 30, ttl: 10_000 },
    long: { limit: 600, ttl: 3_600_000 },
  })
  packs() {
    return this.payments.listPacks();
  }

  /** Public — also surfaces whether payments are configured at all (useful
   * for the deploy verifier and for the UI to show a helpful "coming soon"
   * state pre-launch). */
  @Get('health')
  @Throttle({
    short: { limit: 30, ttl: 10_000 },
    long: { limit: 600, ttl: 3_600_000 },
  })
  health() {
    return this.payments.health();
  }

  /** User must be SIWE-logged-in to create a payment intent. */
  @Post('create')
  @UseGuards(WalletAuthGuard)
  @Throttle({
    short: { limit: 5, ttl: 60_000 },
    long: { limit: 100, ttl: 86_400_000 },
  })
  async create(@Req() req: Request, @Body() body: CreatePaymentBody) {
    const u = req.walletUser!;
    const code = (body?.packCode ?? '').trim();
    return this.payments.createPayment({ userId: u.id, packCode: code });
  }

  /** Public read — the paymentRef is unguessable (uuid). The polling UI hits
   * this every few seconds while waiting for on-chain confirmation. */
  @Get(':paymentRef/status')
  @Throttle({
    short: { limit: 60, ttl: 10_000 },
    long: { limit: 1200, ttl: 3_600_000 },
  })
  status(@Param('paymentRef') paymentRef: string) {
    return this.payments.getStatusByRef(paymentRef);
  }
}
