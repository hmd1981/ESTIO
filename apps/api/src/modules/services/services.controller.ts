import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SiteLocale } from '@prisma/client';
import { CatalogService } from './catalog.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly catalog: CatalogService) {}

  @Post()
  create(@Body() dto: CreateServiceDto) {
    return this.catalog.create(dto);
  }

  @Get()
  findAll() {
    return this.catalog.findAll();
  }

  @Get('by-slug/:slug')
  findBySlug(@Param('slug') slug: string, @Query('locale') localeRaw?: string) {
    const locale =
      localeRaw && Object.values(SiteLocale).includes(localeRaw as SiteLocale)
        ? (localeRaw as SiteLocale)
        : SiteLocale.en;
    return this.catalog.findOneBySlug(slug, locale);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catalog.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.catalog.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.catalog.remove(id);
  }
}
