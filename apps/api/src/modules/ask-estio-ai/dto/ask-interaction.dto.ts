import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class AskInteractionDto {
  @IsString()
  @MinLength(4)
  @MaxLength(80)
  sessionId!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(40)
  logId!: string;

  @IsIn(['primary_cta', 'secondary_cta'])
  kind!: 'primary_cta' | 'secondary_cta';
}
