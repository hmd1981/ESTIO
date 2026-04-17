import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WorkstationRunService } from './workstation-run.service';
import { WorkstationController } from './workstation.controller';

@Module({
  imports: [HttpModule],
  controllers: [WorkstationController],
  providers: [WorkstationRunService],
  exports: [WorkstationRunService],
})
export class WorkstationModule {}
