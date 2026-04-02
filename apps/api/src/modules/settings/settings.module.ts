import { Module } from '@nestjs/common';
import { RevalidationModule } from '../revalidation/revalidation.module';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [RevalidationModule],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
