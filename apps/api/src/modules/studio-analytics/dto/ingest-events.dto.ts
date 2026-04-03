import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class StudioEventDto {
  /** Client wire name (e.g. `studio_page_view`) or canonical `page_view` — normalized at ingest. */
  @IsString()
  @MaxLength(40)
  type: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  intent?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  source?: string;

  @IsOptional()
  @IsNumber()
  quality?: number;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  ctaPosition?: string;

  @IsOptional()
  @IsBoolean()
  clicked?: boolean;

  @IsOptional()
  @IsNumber()
  hoverDuration?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  exitGoal?: string;

  @IsNumber()
  ts: number;
}

export class IngestEventsDto {
  /** If set, must equal STUDIO_RAW_EVENT_SCHEMA_VERSION (frozen ingest v1). */
  @IsOptional()
  @IsNumber()
  schemaVersion?: number;

  @IsString()
  @MaxLength(64)
  sessionId: string;

  @IsOptional()
  @IsString()
  @MaxLength(4)
  locale?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudioEventDto)
  events: StudioEventDto[];
}
