import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { AutomationModule } from '../automation/automation.module';
import { SalesSettingsModule } from '../sales-settings/sales-settings.module';
import { LeadScoringService } from './lead-scoring.service';
import { LeadsAdminController } from './leads.admin.controller';
import { LeadsPublicController } from './leads.public.controller';
import { LeadsService } from './leads.service';

@Module({
  imports: [AuthModule, SalesSettingsModule, AutomationModule],
  controllers: [LeadsPublicController, LeadsAdminController],
  providers: [LeadsService, LeadScoringService],
  exports: [LeadsService],
})
export class LeadsModule {}
