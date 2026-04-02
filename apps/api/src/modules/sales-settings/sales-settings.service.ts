import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const DEFAULT_ID = 'default';

@Injectable()
export class SalesSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureDefault() {
    await this.prisma.salesSettings.upsert({
      where: { id: DEFAULT_ID },
      create: { id: DEFAULT_ID },
      update: {},
    });
  }

  async get() {
    await this.ensureDefault();
    return this.prisma.salesSettings.findUniqueOrThrow({
      where: { id: DEFAULT_ID },
    });
  }

  async patch(data: Prisma.SalesSettingsUpdateInput) {
    await this.ensureDefault();
    return this.prisma.salesSettings.update({
      where: { id: DEFAULT_ID },
      data,
    });
  }
}
