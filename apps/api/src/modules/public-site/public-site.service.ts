import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ContentStatus,
  NavigationLocation,
  PageStatus,
  SiteLocale,
} from '@prisma/client';
import { MARKETING_PAGE_SLUGS } from '../cms/marketing-page-slugs';
import { PrismaService } from '../../prisma/prisma.service';

/** Aggregates read-only data for the public marketing site (one round-trip per SSR). */
@Injectable()
export class PublicSiteService {
  constructor(private readonly prisma: PrismaService) {}

  private previewTokenOk(token: string) {
    const expected = process.env.PREVIEW_TOKEN?.trim();
    return Boolean(expected && token === expected);
  }

  async getBundle(locale: SiteLocale) {
    const [
      settings,
      headerNav,
      footerNav,
      marketingPagesList,
      services,
      mediaAssets,
    ] = await Promise.all([
      this.prisma.settings.findFirst(),
      this.prisma.navigationItem.findMany({
        where: {
          location: NavigationLocation.HEADER,
          locale,
          isActive: true,
        },
        orderBy: { orderIndex: 'asc' },
      }),
      this.prisma.navigationItem.findMany({
        where: {
          location: NavigationLocation.FOOTER,
          locale,
          isActive: true,
        },
        orderBy: { orderIndex: 'asc' },
      }),
      this.prisma.page.findMany({
        where: {
          locale,
          slug: { in: [...MARKETING_PAGE_SLUGS] },
          status: PageStatus.PUBLISHED,
        },
      }),
      this.prisma.service.findMany({
        where: { locale, status: ContentStatus.PUBLISHED },
        orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }],
      }),
      this.buildMediaAssetsMap(),
    ]);

    const marketingPages = this.mapMarketingPages(marketingPagesList);
    const homePage = marketingPages.home ?? null;

    return {
      locale,
      settings,
      navigation: { header: headerNav, footer: footerNav },
      homePage,
      marketingPages,
      services,
      mediaAssets,
    };
  }

  /** Draft-aware bundle for preview tooling (token must match `PREVIEW_TOKEN`). */
  async getPreviewBundle(locale: SiteLocale, token: string) {
    if (!this.previewTokenOk(token)) {
      throw new UnauthorizedException('Invalid preview token');
    }

    const [
      settings,
      headerNav,
      footerNav,
      marketingPagesList,
      services,
      mediaAssets,
    ] = await Promise.all([
      this.prisma.settings.findFirst(),
      this.prisma.navigationItem.findMany({
        where: {
          location: NavigationLocation.HEADER,
          locale,
          isActive: true,
        },
        orderBy: { orderIndex: 'asc' },
      }),
      this.prisma.navigationItem.findMany({
        where: {
          location: NavigationLocation.FOOTER,
          locale,
          isActive: true,
        },
        orderBy: { orderIndex: 'asc' },
      }),
      this.prisma.page.findMany({
        where: {
          locale,
          slug: { in: [...MARKETING_PAGE_SLUGS] },
        },
      }),
      this.prisma.service.findMany({
        where: { locale, status: ContentStatus.PUBLISHED },
        orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }],
      }),
      this.buildMediaAssetsMap(),
    ]);

    const marketingPages = this.mapMarketingPages(marketingPagesList);
    const homePage = marketingPages.home ?? null;

    return {
      locale,
      settings,
      navigation: { header: headerNav, footer: footerNav },
      homePage,
      marketingPages,
      services,
      mediaAssets,
      preview: true as const,
    };
  }

  /** Id → public URL + optional alt for resolving `imageMediaAssetId` on the web app. */
  private async buildMediaAssetsMap(): Promise<
    Record<string, { url: string; alt?: string; mimeType?: string }>
  > {
    const rows = await this.prisma.mediaAsset.findMany({
      where: { publicUrl: { not: null } },
      select: { id: true, publicUrl: true, altText: true, mimeType: true },
    });
    const out: Record<
      string,
      { url: string; alt?: string; mimeType?: string }
    > = {};
    for (const r of rows) {
      const url = r.publicUrl?.trim();
      if (!url) continue;
      out[r.id] = {
        url,
        alt: r.altText?.trim() || undefined,
        mimeType: r.mimeType?.trim() || undefined,
      };
    }
    return out;
  }

  private mapMarketingPages(
    rows: { slug: string; locale: SiteLocale }[],
  ): Record<string, (typeof rows)[0] | null> {
    const out: Record<string, (typeof rows)[0] | null> = {};
    for (const slug of MARKETING_PAGE_SLUGS) {
      out[slug] = rows.find((r) => r.slug === slug) ?? null;
    }
    return out;
  }
}
