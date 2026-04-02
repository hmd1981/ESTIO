import { ContentStatus, ServiceCategory, SiteLocale } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/** Validates payload for Prisma `Service` (public catalog entries under `/services`). */
export class CreateServiceDto {
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

  @IsString()
  @MaxLength(2000)
  shortDescription!: string;

  @IsString()
  @MinLength(1)
  longDescription!: string;

  @IsEnum(ServiceCategory)
  category!: ServiceCategory;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsObject()
  detailBlocks?: Record<string, unknown>;
}
