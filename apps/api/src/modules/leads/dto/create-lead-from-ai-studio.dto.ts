import { Type } from 'class-transformer';
import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { AskEstioAiHandoffDto } from './ask-estio-ai-handoff.dto';

const INTENTS = ['images', 'video', 'brand'] as const;

export class CreateLeadFromAiStudioDto {
  @IsString()
  @MinLength(4)
  @MaxLength(200)
  sessionId!: string;

  @IsIn(INTENTS)
  intent!: (typeof INTENTS)[number];

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  goalText?: string;

  /** e.g. cta_click | exit_intent | contact_form */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  source?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  device?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  locale?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  ctaPosition?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AskEstioAiHandoffDto)
  askEstioAi?: AskEstioAiHandoffDto;
}
