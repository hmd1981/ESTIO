import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateMessageTemplateDto } from './dto/create-message-template.dto';
import type { PatchMessageTemplateDto } from './dto/patch-message-template.dto';
import { DEFAULT_RESPONSE_TEMPLATES } from './default-templates';

@Injectable()
export class MessageTemplatesService {
  private readonly logger = new Logger(MessageTemplatesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Seeds default response templates if none exist.
   * Called on module init to ensure the conversion system has templates ready.
   */
  async seedDefaults() {
    const count = await this.prisma.messageTemplate.count();
    if (count > 0) return;

    this.logger.log(
      `Seeding ${DEFAULT_RESPONSE_TEMPLATES.length} default response templates`,
    );

    for (const tpl of DEFAULT_RESPONSE_TEMPLATES) {
      await this.prisma.messageTemplate.create({
        data: {
          name: tpl.name,
          channel: tpl.channel,
          subject: tpl.subject,
          body: tpl.body,
        },
      });
    }
  }

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
        data: data,
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
