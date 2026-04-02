import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import type { Prisma } from '@prisma/client';

export class PatchSalesSettingsDto {
  @IsOptional()
  @IsObject()
  scoringRules?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  automationRules?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  defaultOwnerUserId?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  staleLeadDays?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(720)
  followUpReminderHours?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  proposalFollowUpDays?: number;

  @IsOptional()
  @IsBoolean()
  lostReasonWhenLostRequired?: boolean;

  toPrismaUpdate(): Prisma.SalesSettingsUpdateInput {
    const data: Prisma.SalesSettingsUpdateInput = {};
    if (this.scoringRules !== undefined) {
      data.scoringRules = this.scoringRules as Prisma.InputJsonValue;
    }
    if (this.automationRules !== undefined) {
      data.automationRules = this.automationRules as Prisma.InputJsonValue;
    }
    if (this.defaultOwnerUserId !== undefined) {
      data.defaultOwnerUserId = this.defaultOwnerUserId;
    }
    if (this.staleLeadDays !== undefined) {
      data.staleLeadDays = this.staleLeadDays;
    }
    if (this.followUpReminderHours !== undefined) {
      data.followUpReminderHours = this.followUpReminderHours;
    }
    if (this.proposalFollowUpDays !== undefined) {
      data.proposalFollowUpDays = this.proposalFollowUpDays;
    }
    if (this.lostReasonWhenLostRequired !== undefined) {
      data.lostReasonWhenLostRequired = this.lostReasonWhenLostRequired;
    }
    return data;
  }
}
