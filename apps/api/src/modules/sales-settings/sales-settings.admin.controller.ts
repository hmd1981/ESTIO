import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PatchSalesSettingsDto } from './dto/patch-sales-settings.dto';
import { SalesSettingsService } from './sales-settings.service';

@Controller('admin/sales-settings')
@UseGuards(JwtAuthGuard)
export class SalesSettingsAdminController {
  constructor(private readonly settings: SalesSettingsService) {}

  @Get()
  get() {
    return this.settings.get();
  }

  @Patch()
  patch(@Body() dto: PatchSalesSettingsDto) {
    return this.settings.patch(dto.toPrismaUpdate());
  }
}
