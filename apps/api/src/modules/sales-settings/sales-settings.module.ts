import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { SalesSettingsAdminController } from './sales-settings.admin.controller';
import { SalesSettingsRestController } from './sales-settings.rest.controller';
import { SalesSettingsService } from './sales-settings.service';

@Module({
  imports: [AuthModule],
  controllers: [SalesSettingsAdminController, SalesSettingsRestController],
  providers: [SalesSettingsService],
  exports: [SalesSettingsService],
})
export class SalesSettingsModule {}
