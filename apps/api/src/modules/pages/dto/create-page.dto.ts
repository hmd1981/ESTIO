import { PageStatus, SiteLocale } from '@prisma/client';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreatePageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  slug!: string;

  @IsOptional()
  @IsEnum(SiteLocale)
  locale?: SiteLocale;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  metaDescription?: string;

  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;

  @IsOptional()
  @IsObject()
  sections?: Record<string, unknown>;
}
