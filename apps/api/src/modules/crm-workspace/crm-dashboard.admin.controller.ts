import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CrmDashboardService } from './crm-dashboard.service';

@Controller('admin/crm')
@UseGuards(JwtAuthGuard)
export class CrmDashboardAdminController {
  constructor(private readonly crmDashboard: CrmDashboardService) {}

  @Get('dashboard')
  getSnapshot() {
    return this.crmDashboard.snapshot();
  }
}
