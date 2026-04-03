import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PatchSalesSettingsDto } from './dto/patch-sales-settings.dto';
import { SalesSettingsService } from './sales-settings.service';

/** Alias routes: GET/PUT `/sales-settings` (same JWT as admin). */
@Controller('sales-settings')
@UseGuards(JwtAuthGuard)
export class SalesSettingsRestController {
  constructor(private readonly settings: SalesSettingsService) {}

  @Get()
  get() {
    return this.settings.get();
  }

  @Put()
  put(@Body() dto: PatchSalesSettingsDto) {
    return this.settings.patch(dto.toPrismaUpdate());
  }
}
