import { Module } from '@nestjs/common';
import { LeadsModule } from '../leads/leads.module';
import { IntakeController } from './intake.controller';
import { IntakeService } from './intake.service';

@Module({
  imports: [LeadsModule],
  controllers: [IntakeController],
  providers: [IntakeService],
})
export class IntakeModule {}
