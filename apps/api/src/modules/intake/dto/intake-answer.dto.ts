import { IsObject, IsString, MinLength } from 'class-validator';

export class IntakeAnswerDto {
  @IsString()
  @MinLength(10)
  sessionId!: string;

  @IsObject()
  answers!: Record<string, string>;
}
