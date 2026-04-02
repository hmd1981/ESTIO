import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { SiteLocale } from '@prisma/client';
import { PublicSiteService } from './public-site.service';

@Controller('public')
export class PublicSiteController {
  constructor(private readonly publicSiteService: PublicSiteService) {}

  @Get('site/:locale')
  getSite(@Param('locale') localeRaw: string) {
    this.assertLocale(localeRaw);
    return this.publicSiteService.getBundle(localeRaw as SiteLocale);
  }

  /** Draft-aware site bundle for preview (requires `PREVIEW_TOKEN`). */
  @Get('site/:locale/preview')
  getSitePreview(
    @Param('locale') localeRaw: string,
    @Query('token') token?: string,
  ) {
    this.assertLocale(localeRaw);
    if (!token?.trim()) {
      throw new BadRequestException('token query parameter is required');
    }
    return this.publicSiteService.getPreviewBundle(
      localeRaw as SiteLocale,
      token.trim(),
    );
  }

  private assertLocale(localeRaw: string) {
    if (
      localeRaw !== SiteLocale.en &&
      localeRaw !== SiteLocale.ar
    ) {
      throw new BadRequestException('Invalid locale (use en or ar)');
    }
  }
}
