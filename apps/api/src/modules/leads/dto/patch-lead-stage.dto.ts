import { CrmPipelineStage } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class PatchLeadStageDto {
  @IsEnum(CrmPipelineStage)
  stage!: CrmPipelineStage;
}
