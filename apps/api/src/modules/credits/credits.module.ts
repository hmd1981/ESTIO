import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { WalletAuthModule } from '../wallet-auth/wallet-auth.module';
import { CreditsController } from './credits.controller';
import { CreditsService } from './credits.service';

@Module({
  imports: [PrismaModule, WalletAuthModule],
  controllers: [CreditsController],
  providers: [CreditsService],
  exports: [CreditsService],
})
export class CreditsModule {}
