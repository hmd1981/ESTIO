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
import { CreateSeoDto } from './dto/create-seo.dto';
import { UpdateSeoDto } from './dto/update-seo.dto';
import { SeoService } from './seo.service';

@Controller('seo')
export class SeoController {
  constructor(private readonly seoService: SeoService) {}

  @Post()
  create(@Body() dto: CreateSeoDto) {
    return this.seoService.create(dto);
  }

  @Get()
  findAll() {
    return this.seoService.findAll();
  }

  /** Resolve SEO row by public path, e.g. `?path=/services` */
  @Get('lookup')
  findByRoute(
    @Query('path') path: string,
    @Query('locale') localeRaw?: string,
  ) {
    const locale =
      localeRaw && Object.values(SiteLocale).includes(localeRaw as SiteLocale)
        ? (localeRaw as SiteLocale)
        : SiteLocale.en;
    return this.seoService.findByRoute(path, locale);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSeoDto) {
    return this.seoService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.seoService.remove(id);
  }
}
