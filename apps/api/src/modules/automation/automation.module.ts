import { Module } from '@nestjs/common';
import { SalesSettingsModule } from '../sales-settings/sales-settings.module';
import { AutomationService } from './automation.service';
import { LeadClassificationService } from '../leads/lead-classification.service';
import { ResponseOrchestratorService } from '../leads/response-orchestrator.service';

@Module({
  imports: [SalesSettingsModule],
  providers: [
    AutomationService,
    LeadClassificationService,
    ResponseOrchestratorService,
  ],
  exports: [AutomationService, LeadClassificationService],
})
export class AutomationModule {}
