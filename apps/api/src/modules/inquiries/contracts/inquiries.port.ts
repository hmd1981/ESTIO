import type { Inquiry } from '../../../contracts/entities';
import type { CreateInquiryDto } from '../dto/create-inquiry.dto';
import type { UpdateInquiryDto } from '../dto/update-inquiry.dto';

export interface InquiriesPort {
  create(dto: CreateInquiryDto): Promise<Inquiry>;
  findAll(): Promise<Inquiry[]>;
  findOne(id: string): Promise<Inquiry>;
  update(id: string, dto: UpdateInquiryDto): Promise<Inquiry>;
}
