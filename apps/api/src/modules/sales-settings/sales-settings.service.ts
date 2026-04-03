import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  DEFAULT_INTENT_MAPPING,
  DEFAULT_PRICING_HINTS,
  DEFAULT_PRIORITY_MAPPING,
  DEFAULT_ROUTING_MAPPING,
} from '../leads/ai-studio-sales.defaults';

const DEFAULT_ID = 'default';

const seedAiStudio: Pick<
  Prisma.SalesSettingsCreateInput,
  | 'isActive'
  | 'intentMapping'
  | 'priorityMapping'
  | 'routingMapping'
  | 'pricingHints'
  | 'defaultStage'
> = {
  isActive: true,
  intentMapping: DEFAULT_INTENT_MAPPING as Prisma.InputJsonValue,
  priorityMapping: DEFAULT_PRIORITY_MAPPING as Prisma.InputJsonValue,
  routingMapping: DEFAULT_ROUTING_MAPPING as Prisma.InputJsonValue,
  pricingHints: DEFAULT_PRICING_HINTS as Prisma.InputJsonValue,
  defaultStage: 'NEW',
};

@Injectable()
export class SalesSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureDefault() {
    await this.prisma.salesSettings.upsert({
      where: { id: DEFAULT_ID },
      create: { id: DEFAULT_ID, ...seedAiStudio },
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
