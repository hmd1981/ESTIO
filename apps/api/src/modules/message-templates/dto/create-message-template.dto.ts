import { MessageChannel, SiteLocale } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateMessageTemplateDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @IsEnum(MessageChannel)
  channel!: MessageChannel;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  subject?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50000)
  body!: string;

  @IsOptional()
  @IsEnum(SiteLocale)
  locale?: SiteLocale;
}
