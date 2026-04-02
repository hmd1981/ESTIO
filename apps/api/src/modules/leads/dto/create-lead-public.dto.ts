import { CrmLeadSource, CrmServiceType, SiteLocale } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Public POST /leads — enums only; supports legacy `name` + `serviceInterest`. */
export class CreateLeadPublicDto {
  @Transform(({ obj }: { obj: Record<string, unknown> }) =>
    String(obj.fullName ?? obj.name ?? '').trim(),
  )
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  fullName!: string;

  @IsEmail()
  @MaxLength(200)
  email!: string;

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

  /** @deprecated Use serviceType; website may still send legacy keys. */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  serviceInterest?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  subServiceType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  message?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  projectScope?: string;

  @IsEnum(CrmLeadSource)
  source!: CrmLeadSource;

  @IsOptional()
  @IsEnum(SiteLocale)
  locale?: SiteLocale;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  referrer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  landingPage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  campaignSource?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  campaignMedium?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  campaignName?: string;
}
