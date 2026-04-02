import {
  CrmBudgetRange,
  CrmBusinessType,
  CrmLeadSource,
  CrmLeadStatus,
  CrmLostReason,
  CrmPipelineStage,
  CrmPriority,
  CrmServiceType,
  CrmTeamSize,
  CrmTimeline,
  SiteLocale,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class PatchLeadAdminDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  whatsapp?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  company?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  jobTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsEnum(CrmServiceType)
  serviceType?: CrmServiceType;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  subServiceType?: string;

  @IsOptional()
  @IsEnum(CrmBusinessType)
  businessType?: CrmBusinessType;

  @IsOptional()
  @IsEnum(CrmTeamSize)
  teamSize?: CrmTeamSize;

  @IsOptional()
  @IsEnum(CrmBudgetRange)
  budgetRange?: CrmBudgetRange;

  @IsOptional()
  @IsEnum(CrmTimeline)
  timeline?: CrmTimeline;

  @IsOptional()
  @IsString()
  projectScope?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsEnum(CrmLeadStatus)
  status?: CrmLeadStatus;

  @IsOptional()
  @IsEnum(CrmPipelineStage)
  stage?: CrmPipelineStage;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1000)
  score?: number;

  @IsOptional()
  @IsEnum(CrmPriority)
  priority?: CrmPriority;

  @IsOptional()
  @IsString()
  ownerUserId?: string | null;

  @IsOptional()
  @IsDateString()
  lastContactedAt?: string | null;

  @IsOptional()
  @IsDateString()
  nextFollowUpAt?: string | null;

  @IsOptional()
  @IsEnum(CrmLostReason)
  lostReason?: CrmLostReason;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  wonValue?: number | null;

  @IsOptional()
  @IsEnum(CrmLeadSource)
  source?: CrmLeadSource;

  @IsOptional()
  @IsEnum(SiteLocale)
  locale?: SiteLocale;

  @IsOptional()
  @IsString()
  referrer?: string | null;

  @IsOptional()
  @IsString()
  landingPage?: string | null;
}
