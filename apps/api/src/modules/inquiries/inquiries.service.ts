import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InquiriesPort } from './contracts/inquiries.port';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { UpdateInquiryDto } from './dto/update-inquiry.dto';

@Injectable()
export class InquiriesService implements InquiriesPort {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateInquiryDto) {
    return this.prisma.inquiry.create({ data: dto });
  }

  findAll() {
    return this.prisma.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.inquiry.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Inquiry not found: ${id}`);
    }
    return row;
  }

  async update(id: string, dto: UpdateInquiryDto) {
    try {
      return await this.prisma.inquiry.update({
        where: { id },
        data: dto,
      });
    } catch {
      throw new NotFoundException(`Inquiry not found: ${id}`);
    }
  }
}
