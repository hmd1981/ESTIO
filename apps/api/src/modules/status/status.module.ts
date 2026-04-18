import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { StatusController } from './status.controller';
import { StatusService } from './status.service';

@Module({
  imports: [HttpModule],
  controllers: [StatusController],
  providers: [StatusService],
  exports: [StatusService],
})
export class StatusModule {}
