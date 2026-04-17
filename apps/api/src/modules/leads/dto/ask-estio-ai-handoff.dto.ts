import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** CRM / public lead payloads — optional context from Ask Estio AI. */
export class AskEstioAiHandoffDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  userMessage!: string;

  @IsIn(['images', 'video', 'brand', 'unknown'])
  detectedIntent!: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === undefined ? undefined : value))
  @IsString()
  @MaxLength(256)
  recommendedOffer?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === undefined ? undefined : value))
  @IsString()
  @MaxLength(600)
  responseSummary?: string;

  @IsString()
  @MinLength(4)
  @MaxLength(80)
  sessionId!: string;
}
