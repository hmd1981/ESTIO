import { Module } from '@nestjs/common';
import { SalesSettingsModule } from '../sales-settings/sales-settings.module';
import { AutomationService } from './automation.service';

@Module({
  imports: [SalesSettingsModule],
  providers: [AutomationService],
  exports: [AutomationService],
})
export class AutomationModule {}
