import { Injectable, NotFoundException } from '@nestjs/common';
import { SiteLocale } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SeoPort } from './contracts/seo.port';
import { CreateSeoDto } from './dto/create-seo.dto';
import { UpdateSeoDto } from './dto/update-seo.dto';

@Injectable()
export class SeoService implements SeoPort {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateSeoDto) {
    const locale = dto.locale ?? SiteLocale.en;
    return this.prisma.seoMetadata.create({ data: { ...dto, locale } });
  }

  findAll() {
    return this.prisma.seoMetadata.findMany({
      orderBy: { route: 'asc' },
    });
  }

  async findByRoute(route: string, locale: SiteLocale = SiteLocale.en) {
    const row = await this.prisma.seoMetadata.findUnique({
      where: { route_locale: { route, locale } },
    });
    if (!row) {
      throw new NotFoundException(`SEO entry not found: ${route} (${locale})`);
    }
    return row;
  }

  async update(id: string, dto: UpdateSeoDto) {
    try {
      return await this.prisma.seoMetadata.update({
        where: { id },
        data: dto,
      });
    } catch {
      throw new NotFoundException(`SEO entry not found: ${id}`);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.seoMetadata.delete({ where: { id } });
    } catch {
      throw new NotFoundException(`SEO entry not found: ${id}`);
    }
  }
}
