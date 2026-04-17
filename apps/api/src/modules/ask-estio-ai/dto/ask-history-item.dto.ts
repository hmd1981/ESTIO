import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class AskHistoryItemDto {
  @IsIn(['user', 'assistant'])
  role!: 'user' | 'assistant';

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  content!: string;
}
