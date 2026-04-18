import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { Req } from '@nestjs/common';
import { WalletAuthGuard } from './wallet-auth.guard';
import { WalletAuthService } from './wallet-auth.service';

@Controller('auth/wallet')
export class WalletAuthController {
  constructor(private readonly auth: WalletAuthService) {}

  /** Slightly tighter than the global short tier — issuing nonces is cheap
   * but a single attacker spamming this fills the SiweNonce table. */
  @Get('nonce')
  @Throttle({
    short: { limit: 10, ttl: 60_000 },
    long: { limit: 200, ttl: 86_400_000 },
  })
  nonce(@Query('address') address: string) {
    return this.auth.nonce(address);
  }

  /** Verification is the expensive crypto path; throttle stricter still. */
  @Post('verify')
  @Throttle({
    short: { limit: 5, ttl: 60_000 },
    long: { limit: 50, ttl: 86_400_000 },
  })
  verify(@Body() body: { address: string; signature: string; message: string }) {
    return this.auth.verify(body);
  }

  /** Convenience — UI calls this to test that a stored token is still good. */
  @Get('me')
  @UseGuards(WalletAuthGuard)
  me(@Req() req: Request) {
    return { user: req.walletUser };
  }
}
