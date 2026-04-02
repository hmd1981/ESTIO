import { CrmLeadStatus, CrmLostReason } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class PatchLeadStatusDto {
  @IsEnum(CrmLeadStatus)
  status!: CrmLeadStatus;

  @IsOptional()
  @IsEnum(CrmLostReason)
  lostReason?: CrmLostReason;
}
