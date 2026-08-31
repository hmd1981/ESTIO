import { Body, Controller, Get, Put } from '@nestjs/common';
import { UpsertSettingsDto } from './dto/upsert-settings.dto';
import { SettingsService } from './settings.service';
import { RevalidationService } from '../revalidation/revalidation.service';

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly revalidation: RevalidationService,
  ) {}

  @Get()
  get() {
    return this.settingsService.get();
  }

  @Put()
  async upsert(@Body() dto: UpsertSettingsDto) {
    const row = await this.settingsService.upsert(dto);
    await this.revalidation.revalidateTags([
      'public-site:en',
      'public-site:ar',
    ]);
    return row;
  }
}
