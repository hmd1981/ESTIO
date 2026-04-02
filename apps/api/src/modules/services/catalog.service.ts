import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Prisma, SiteLocale } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RevalidationService } from '../revalidation/revalidation.service';
import { ServiceCatalogPort } from './contracts/service-catalog.port';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

/** Prisma-backed catalogue for the `Service` model; HTTP routes live on `/services`. */
@Injectable()
export class CatalogService implements ServiceCatalogPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidation: RevalidationService,
  ) {}

  create(dto: CreateServiceDto) {
    const locale = dto.locale ?? SiteLocale.en;
    const { detailBlocks, ...rest } = dto;
    return this.prisma.service.create({
      data: {
        ...rest,
        locale,
        detailBlocks:
          detailBlocks === undefined
            ? undefined
            : (detailBlocks as Prisma.InputJsonValue),
      },
    });
  }

  findAll() {
    return this.prisma.service.findMany({
      orderBy: [{ featured: 'desc' }, { updatedAt: 'desc' }],
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.service.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Service not found: ${id}`);
    }
    return row;
  }

  async findOneBySlug(slug: string, locale: SiteLocale = SiteLocale.en) {
    const row = await this.prisma.service.findUnique({
      where: { slug_locale: { slug, locale } },
    });
    if (!row || row.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException(`Service not found: ${slug} (${locale})`);
    }
    return row;
  }

  async update(id: string, dto: UpdateServiceDto) {
    try {
      const before = await this.prisma.service.findUnique({ where: { id } });
      const { detailBlocks, ...rest } = dto;
      const row = await this.prisma.service.update({
        where: { id },
        data: {
          ...rest,
          ...(detailBlocks !== undefined
            ? {
                detailBlocks: detailBlocks as Prisma.InputJsonValue,
              }
            : {}),
        },
      });
      const becamePublished =
        before?.status !== ContentStatus.PUBLISHED &&
        row.status === ContentStatus.PUBLISHED;
      const staysPublished = before?.status === ContentStatus.PUBLISHED;
      if (becamePublished || staysPublished) {
        await this.revalidation.revalidateTags([
          `public-site:${row.locale}`,
          `service:${row.locale}:${row.slug}`,
        ]);
      }
      return row;
    } catch {
      throw new NotFoundException(`Service not found: ${id}`);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.service.delete({ where: { id } });
    } catch {
      throw new NotFoundException(`Service not found: ${id}`);
    }
  }
}
