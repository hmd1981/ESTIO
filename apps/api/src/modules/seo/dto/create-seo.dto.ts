import { SiteLocale } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateSeoDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  route!: string;

  @IsOptional()
  @IsEnum(SiteLocale)
  locale?: SiteLocale;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(2000)
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  ogImage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  canonicalUrl?: string;
}
