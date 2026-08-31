import { NavigationLocation, SiteLocale } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateNavigationItemDto {
  @IsString()
  @MaxLength(120)
  label!: string;

  @IsString()
  @MaxLength(500)
  href!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;

  @IsEnum(NavigationLocation)
  location!: NavigationLocation;

  @IsOptional()
  @IsEnum(SiteLocale)
  locale?: SiteLocale;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
