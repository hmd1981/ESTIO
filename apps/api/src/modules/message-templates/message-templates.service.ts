import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateMessageTemplateDto } from './dto/create-message-template.dto';
import type { PatchMessageTemplateDto } from './dto/patch-message-template.dto';

@Injectable()
export class MessageTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.messageTemplate.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  create(dto: CreateMessageTemplateDto) {
    return this.prisma.messageTemplate.create({
      data: {
        name: dto.name.trim(),
        channel: dto.channel,
        subject: dto.subject?.trim(),
        body: dto.body,
        locale: dto.locale,
      },
    });
  }

  async patch(id: string, dto: PatchMessageTemplateDto) {
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.channel !== undefined) data.channel = dto.channel;
    if (dto.subject !== undefined) data.subject = dto.subject;
    if (dto.body !== undefined) data.body = dto.body;
    if (dto.locale !== undefined) data.locale = dto.locale;
    try {
      return await this.prisma.messageTemplate.update({
        where: { id },
        data: data as Prisma.MessageTemplateUpdateInput,
      });
    } catch {
      throw new NotFoundException(`Template not found: ${id}`);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.messageTemplate.delete({ where: { id } });
      return { ok: true };
    } catch {
      throw new NotFoundException(`Template not found: ${id}`);
    }
  }
}
