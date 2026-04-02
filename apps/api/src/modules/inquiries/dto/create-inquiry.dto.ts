import { InquiryStatus, InquiryType } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateInquiryDto {
  @IsEnum(InquiryType)
  type!: InquiryType;

  @IsString()
  @MaxLength(200)
  name!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  company?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  message!: string;

  @IsOptional()
  @IsEnum(InquiryStatus)
  status?: InquiryStatus;
}
