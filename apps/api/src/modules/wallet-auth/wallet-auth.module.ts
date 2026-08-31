import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../../prisma/prisma.module';
import { MaybeWalletAuthGuard } from './maybe-wallet-auth.guard';
import { WalletAuthController } from './wallet-auth.controller';
import { WalletAuthGuard } from './wallet-auth.guard';
import { WalletAuthService } from './wallet-auth.service';

/**
 * Wallet auth (SIWE) — separate from the existing AuthModule (admin password
 * login) so the user-auth surface area is small and obvious. We re-register
 * JwtModule rather than importing AuthModule's so this module can be moved
 * (or its secret rotated separately) without ripple.
 */
@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'development-only-secret',
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN ??
          '7d') as `${number}${'ms' | 's' | 'm' | 'h' | 'd'}`,
      },
    }),
  ],
  controllers: [WalletAuthController],
  providers: [WalletAuthService, WalletAuthGuard, MaybeWalletAuthGuard],
  exports: [
    WalletAuthService,
    WalletAuthGuard,
    MaybeWalletAuthGuard,
    JwtModule,
  ],
})
export class WalletAuthModule {}
