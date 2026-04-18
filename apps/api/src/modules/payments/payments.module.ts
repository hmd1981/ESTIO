import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { CreditsModule } from '../credits/credits.module';
import { WalletAuthModule } from '../wallet-auth/wallet-auth.module';
import { PaymentWatcherService } from './payment-watcher.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [PrismaModule, WalletAuthModule, CreditsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentWatcherService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
