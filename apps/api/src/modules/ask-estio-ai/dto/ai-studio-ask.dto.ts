import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { AskContextDto } from './ask-context.dto';
import { AskHistoryItemDto } from './ask-history-item.dto';

export class AiStudioAskDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  message!: string;

  @IsString()
  @MinLength(4)
  @MaxLength(80)
  sessionId!: string;

  @IsIn(['en', 'ar'])
  locale!: 'en' | 'ar';

  @IsString()
  @MaxLength(32)
  page!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  source?: string;

  /** Optional hint for tone context only; the model still classifies intent from the message. */
  @IsOptional()
  @IsIn(['images', 'video', 'brand', 'unknown'])
  intentHint?: 'images' | 'video' | 'brand' | 'unknown';

  /** Session-derived fields from the client (intent, use-case, memory). */
  @IsOptional()
  @ValidateNested()
  @Type(() => AskContextDto)
  context?: AskContextDto;

  /** Site language (defaults to `locale` if omitted). */
  @IsOptional()
  @IsIn(['en', 'ar'])
  pageLocale?: 'en' | 'ar';

  /** Client-detected language of the latest user message; server may refine. */
  @IsOptional()
  @IsIn(['en', 'ar', 'fa', 'mixed', 'unknown'])
  detectedLanguage?: 'en' | 'ar' | 'fa' | 'mixed' | 'unknown';

  /** Completed user→assistant rounds before this request (0 = first message). */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  turnCount?: number;

  /** Last 2–3 turns only (max 6 messages); must NOT include the current `message`. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @ValidateNested({ each: true })
  @Type(() => AskHistoryItemDto)
  history?: AskHistoryItemDto[];

  /** Client-detected short confirmation (yes/ok/نعم…); server re-validates. */
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === 1)
  @IsBoolean()
  confirmationDetected?: boolean;
}
