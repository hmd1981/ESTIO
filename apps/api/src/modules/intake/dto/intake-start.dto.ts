import { CrmServiceType, SiteLocale } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class IntakeStartDto {
  @IsOptional()
  @IsEnum(CrmServiceType)
  branch?: CrmServiceType;

  @IsOptional()
  @IsEnum(SiteLocale)
  locale?: SiteLocale;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  landingPage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  referrer?: string;
}
