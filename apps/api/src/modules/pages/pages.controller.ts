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
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PagesService } from './pages.service';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  create(@Body() dto: CreatePageDto) {
    return this.pagesService.create(dto);
  }

  @Get()
  findAll() {
    return this.pagesService.findAll();
  }

  @Get('by-slug/:slug')
  findBySlug(@Param('slug') slug: string, @Query('locale') localeRaw?: string) {
    const locale =
      localeRaw && Object.values(SiteLocale).includes(localeRaw as SiteLocale)
        ? (localeRaw as SiteLocale)
        : SiteLocale.en;
    return this.pagesService.findOneBySlug(slug, locale);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePageDto) {
    return this.pagesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagesService.remove(id);
  }
}
