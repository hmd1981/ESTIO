import { Injectable, NotFoundException } from '@nestjs/common';
import { PageStatus, Prisma, SiteLocale } from '@prisma/client';
import { MediaService } from '../media/media.service';
import { RevalidationService } from '../revalidation/revalidation.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PagesPort } from './contracts/pages.port';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService implements PagesPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
    private readonly revalidation: RevalidationService,
  ) {}

  async create(dto: CreatePageDto) {
    const locale = dto.locale ?? SiteLocale.en;
    const data: Prisma.PageCreateInput = {
      slug: dto.slug,
      locale,
      title: dto.title,
      metaTitle: dto.metaTitle,
      metaDescription: dto.metaDescription,
      status: dto.status,
      sections:
        dto.sections === undefined
          ? undefined
          : (dto.sections as Prisma.InputJsonValue),
    };
    const row = await this.prisma.page.create({ data });
    await this.mediaService.syncPlacementsForPage(
      row.slug,
      row.locale,
      row.sections,
    );
    return row;
  }

  findAll() {
    return this.prisma.page.findMany({
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOneBySlug(slug: string, locale: SiteLocale = SiteLocale.en) {
    const page = await this.prisma.page.findUnique({
      where: { slug_locale: { slug, locale } },
    });
    if (!page) {
      throw new NotFoundException(`Page not found: ${slug} (${locale})`);
    }
    return page;
  }

  async update(id: string, dto: UpdatePageDto) {
    try {
      const before = await this.prisma.page.findUnique({ where: { id } });
      const row = await this.prisma.page.update({
        where: { id },
        data: {
          ...dto,
          sections:
            dto.sections === undefined
              ? undefined
              : (dto.sections as Prisma.InputJsonValue),
        },
      });
      await this.mediaService.syncPlacementsForPage(
        row.slug,
        row.locale,
        row.sections,
      );
      const becamePublished =
        before?.status !== PageStatus.PUBLISHED &&
        row.status === PageStatus.PUBLISHED;
      const staysPublished = before?.status === PageStatus.PUBLISHED;
      if (becamePublished || staysPublished) {
        await this.revalidation.revalidateTags([`public-site:${row.locale}`]);
      }
      return row;
    } catch {
      throw new NotFoundException(`Page not found: ${id}`);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.page.delete({ where: { id } });
    } catch {
      throw new NotFoundException(`Page not found: ${id}`);
    }
  }
}
