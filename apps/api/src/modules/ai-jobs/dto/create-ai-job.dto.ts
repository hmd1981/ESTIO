import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const JOB_TYPES = [
  'text_to_image',
  'text_to_video',
  'text_to_brand',
  'brand_visual_system',
] as const;

export type AiJobTypeDto = (typeof JOB_TYPES)[number];

export class AiJobInputDto {
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  prompt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  referenceImage?: string;

  @IsOptional()
  @IsString()
  @IsIn(['instagram', 'ads', 'landing'])
  platform?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  quantity?: number;
}

export class CreateAiJobDto {
  @IsString()
  @IsIn(JOB_TYPES)
  type!: AiJobTypeDto;

  @ValidateNested()
  @Type(() => AiJobInputDto)
  input!: AiJobInputDto;
}
