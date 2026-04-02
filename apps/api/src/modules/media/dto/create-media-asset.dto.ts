import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateMediaAssetDto {
  @IsString()
  @MaxLength(500)
  fileName!: string;

  @IsString()
  @MaxLength(500)
  originalName!: string;

  @IsString()
  @MaxLength(200)
  mimeType!: string;

  @IsInt()
  @Min(0)
  size!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  altText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  publicUrl?: string;
}
