import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { WalletAuthGuard } from '../wallet-auth/wallet-auth.guard';
import { getGenerationPricingDto } from './generation-pricing';
import { CreditsService } from './credits.service';

@Controller('credits')
export class CreditsController {
  constructor(private readonly credits: CreditsService) {}

  /** Public: generation credit costs per mode (same rules as debit). */
  @Get('generation-pricing')
  generationPricing() {
    return getGenerationPricingDto();
  }

  @Get('balance')
  @UseGuards(WalletAuthGuard)
  async balance(@Req() req: Request) {
    const u = req.walletUser!;
    const balance = await this.credits.getBalance(u.id);
    return {
      walletAddress: u.walletAddress,
      balance,
    };
  }

  /**
   * Append-only activity feed for the wallet user (newest first). Cursor is
   * the `id` of the last entry from the previous page.
   */
  @Get('ledger')
  @UseGuards(WalletAuthGuard)
  async ledger(
    @Req() req: Request,
    @Query('limit') limitRaw?: string,
    @Query('cursor') cursor?: string,
  ) {
    const u = req.walletUser!;
    const parsed = parseInt(limitRaw ?? '20', 10);
    const limit = Number.isFinite(parsed) ? parsed : 20;
    return this.credits.listLedger(u.id, {
      limit,
      cursor: cursor?.trim() || null,
    });
  }
}
