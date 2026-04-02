import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertSettingsDto {
  @IsString()
  @MaxLength(200)
  businessName!: string;

  @IsString()
  @MaxLength(200)
  brandName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  footerText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  businessNameAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  brandNameAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  footerTextAr?: string;

  @IsOptional()
  @IsObject()
  socialLinks?: Record<string, string>;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  whatsapp?: string;

  /** Global labels (CTAs, buttons). Prefer nested locale keys for i18n. */
  @IsOptional()
  @IsObject()
  globalLabels?: Record<string, unknown>;
}
