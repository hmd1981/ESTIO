import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateLeadNoteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20000)
  body!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  authorLabel?: string;
}
