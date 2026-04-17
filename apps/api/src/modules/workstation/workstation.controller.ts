import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { IsObject, IsString, IsIn } from 'class-validator';
import { WorkstationRunService, type WorkstationJobType } from './workstation-run.service';

class WorkerRunDto {
  @IsString()
  @IsIn(['text_to_image', 'text_to_video', 'text_to_brand', 'brand_visual_system'])
  type!: WorkstationJobType;

  @IsObject()
  input!: Record<string, unknown>;
}

/**
 * HTTP surface for worker execution (local stub or external GPU service contract).
 */
@Controller('worker')
export class WorkstationController {
  constructor(private readonly workstationRun: WorkstationRunService) {}

  @Post('run')
  @HttpCode(200)
  async run(
    @Body() body: WorkerRunDto,
    @Headers('x-workstation-secret') secret?: string,
  ) {
    const expected = process.env.WORKSTATION_SECRET?.trim();
    if (expected && secret !== expected) {
      throw new UnauthorizedException();
    }
    return {
      outputs: await this.workstationRun.runHttpStub(body.type, body.input),
    };
  }
}
