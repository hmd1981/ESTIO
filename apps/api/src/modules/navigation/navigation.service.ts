import { Injectable, NotFoundException } from '@nestjs/common';
import { NavigationLocation, SiteLocale } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NavigationPort } from './contracts/navigation.port';
import { CreateNavigationItemDto } from './dto/create-navigation-item.dto';
import { UpdateNavigationItemDto } from './dto/update-navigation-item.dto';

@Injectable()
export class NavigationService implements NavigationPort {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateNavigationItemDto) {
    const locale = dto.locale ?? SiteLocale.en;
    return this.prisma.navigationItem.create({ data: { ...dto, locale } });
  }

  findByLocation(
    location: NavigationLocation,
    locale: SiteLocale = SiteLocale.en,
  ) {
    return this.prisma.navigationItem.findMany({
      where: { location, locale, isActive: true },
      orderBy: { orderIndex: 'asc' },
    });
  }

  findAllAdmin() {
    return this.prisma.navigationItem.findMany({
      orderBy: [{ location: 'asc' }, { orderIndex: 'asc' }],
    });
  }

  async update(id: string, dto: UpdateNavigationItemDto) {
    try {
      return await this.prisma.navigationItem.update({
        where: { id },
        data: dto,
      });
    } catch {
      throw new NotFoundException(`Navigation item not found: ${id}`);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.navigationItem.delete({ where: { id } });
    } catch {
      throw new NotFoundException(`Navigation item not found: ${id}`);
    }
  }
}
