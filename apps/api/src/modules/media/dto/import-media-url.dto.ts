import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class ImportMediaUrlDto {
  @IsString()
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  @MaxLength(4000)
  url!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  originalName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  altText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  category?: string;
}
