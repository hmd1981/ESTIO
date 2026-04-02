import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { AutomationModule } from '../automation/automation.module';
import { AutomationRunsAdminController } from './automation-runs.admin.controller';
import { CrmDashboardAdminController } from './crm-dashboard.admin.controller';
import { CrmDashboardService } from './crm-dashboard.service';
import { CrmTasksAdminController } from './crm-tasks.admin.controller';

@Module({
  imports: [AuthModule, AutomationModule],
  controllers: [
    CrmDashboardAdminController,
    CrmTasksAdminController,
    AutomationRunsAdminController,
  ],
  providers: [CrmDashboardService],
})
export class CrmWorkspaceModule {}
