import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class AskContextDto {
  @IsOptional()
  @IsIn(['images', 'video', 'brand', 'unknown'])
  intent?: 'images' | 'video' | 'brand' | 'unknown';

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().slice(0, 120) : value,
  )
  @IsString()
  @MaxLength(120)
  useCase?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().slice(0, 64) : value,
  )
  @IsString()
  @MaxLength(64)
  platform?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().slice(0, 64) : value,
  )
  @IsString()
  @MaxLength(64)
  stage?: string;

  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value
          .map((v) => String(v ?? '').trim().slice(0, 500))
          .filter((s) => s.length > 0)
          .slice(0, 8)
      : undefined,
  )
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  recentUserMessages?: string[];
}
