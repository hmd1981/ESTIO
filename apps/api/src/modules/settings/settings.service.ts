import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingsPort } from './contracts/settings.port';
import { UpsertSettingsDto } from './dto/upsert-settings.dto';

const SETTINGS_SINGLETON_ID = '00000000-0000-0000-0000-000000000001';

@Injectable()
export class SettingsService implements SettingsPort {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the active settings row, or null if never seeded.
   * Phase 2: replace singleton id with explicit “site settings” migration seed.
   */
  async get() {
    const rows = await this.prisma.settings.findMany({ take: 1 });
    return rows[0] ?? null;
  }

  async upsert(dto: UpsertSettingsDto) {
    const existing = await this.get();
    const social =
      dto.socialLinks === undefined
        ? undefined
        : (dto.socialLinks as Prisma.InputJsonValue);
    const globalLabels =
      dto.globalLabels === undefined
        ? undefined
        : (dto.globalLabels as Prisma.InputJsonValue);

    if (existing) {
      return this.prisma.settings.update({
        where: { id: existing.id },
        data: {
          ...dto,
          socialLinks: social,
          globalLabels,
        },
      });
    }

    return this.prisma.settings.create({
      data: {
        id: SETTINGS_SINGLETON_ID,
        businessName: dto.businessName,
        brandName: dto.brandName,
        website: dto.website,
        phone: dto.phone,
        email: dto.email,
        whatsapp: dto.whatsapp,
        address: dto.address,
        city: dto.city,
        country: dto.country,
        footerText: dto.footerText,
        socialLinks: social,
        globalLabels,
      },
    });
  }
}
