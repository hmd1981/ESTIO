import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { SalesSettings } from '@prisma/client';
import {
  DEFAULT_ROUTING_MAPPING,
  readStringRecord,
  type AiStudioIntent,
} from './ai-studio-sales.defaults';

/**
 * Resolves CRM owner user id from SalesSettings JSON routing keys.
 * - "owner" → defaultOwnerUserId, else first active CrmUser
 * - "sales" → first active member of team named "sales" (case-insensitive), else first active CrmUser
 * - explicit CrmUser id when active
 * - fallback → owner path
 */
@Injectable()
export class LeadRoutingService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveLeadRouting(
    intent: AiStudioIntent,
    settings: SalesSettings,
  ): Promise<string | null> {
    const routingMap = {
      ...DEFAULT_ROUTING_MAPPING,
      ...readStringRecord(settings.routingMapping),
    };
    const rawValue = (routingMap[intent] ?? '').trim();
    if (!rawValue) return this.resolveOwnerFallback(settings);

    if (/^[a-z0-9]{20,}$/i.test(rawValue)) {
      const u = await this.prisma.crmUser.findFirst({
        where: { id: rawValue, isActive: true },
      });
      if (u) return u.id;
    }

    const key = rawValue.toLowerCase();
    if (key === 'owner') return this.resolveOwnerFallback(settings);
    if (key === 'sales') {
      const fromTeam = await this.firstSalesTeamUserId();
      if (fromTeam) return fromTeam;
      const any = await this.firstActiveCrmUserId();
      return any ?? (await this.resolveOwnerFallback(settings));
    }

    return this.resolveOwnerFallback(settings);
  }

  private async resolveOwnerFallback(
    settings: SalesSettings,
  ): Promise<string | null> {
    const owner = settings.defaultOwnerUserId?.trim();
    if (owner) {
      const u = await this.prisma.crmUser.findFirst({
        where: { id: owner, isActive: true },
      });
      if (u) return u.id;
    }
    return this.firstActiveCrmUserId();
  }

  private async firstSalesTeamUserId(): Promise<string | null> {
    const team = await this.prisma.crmTeam.findFirst({
      where: { name: { equals: 'sales', mode: 'insensitive' } },
      include: {
        members: {
          orderBy: { createdAt: 'asc' },
          include: { user: true },
        },
      },
    });
    if (!team) return null;
    for (const m of team.members) {
      if (m.user.isActive) return m.userId;
    }
    return null;
  }

  private async firstActiveCrmUserId(): Promise<string | null> {
    const u = await this.prisma.crmUser.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    return u?.id ?? null;
  }
}
