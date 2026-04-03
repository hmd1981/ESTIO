import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { AutomationModule } from '../automation/automation.module';
import { SalesSettingsModule } from '../sales-settings/sales-settings.module';
import { LeadScoringService } from './lead-scoring.service';
import { LeadClassificationService } from './lead-classification.service';
import { LeadsAdminController } from './leads.admin.controller';
import { CrmLeadsPublicController } from './crm-leads.public.controller';
import { LeadsPublicController } from './leads.public.controller';
import { LeadRoutingService } from './lead-routing.service';
import { LeadsService } from './leads.service';

@Module({
  imports: [AuthModule, SalesSettingsModule, AutomationModule],
  controllers: [
    LeadsPublicController,
    CrmLeadsPublicController,
    LeadsAdminController,
  ],
  providers: [
    LeadsService,
    LeadRoutingService,
    LeadScoringService,
    LeadClassificationService,
  ],
  exports: [LeadsService],
})
export class LeadsModule {}
