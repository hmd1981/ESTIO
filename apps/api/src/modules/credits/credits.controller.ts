import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { WalletAuthGuard } from '../wallet-auth/wallet-auth.guard';
import { CreditsService } from './credits.service';

@Controller('credits')
export class CreditsController {
  constructor(private readonly credits: CreditsService) {}

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
}
