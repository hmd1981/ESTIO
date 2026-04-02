import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { NavigationLocation, SiteLocale } from '@prisma/client';
import { CreateNavigationItemDto } from './dto/create-navigation-item.dto';
import { UpdateNavigationItemDto } from './dto/update-navigation-item.dto';
import { NavigationService } from './navigation.service';

@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Post()
  create(@Body() dto: CreateNavigationItemDto) {
    return this.navigationService.create(dto);
  }

  /** Public-style read: active items for a location (e.g. HEADER). */
  @Get('public')
  findPublic(
    @Query('location', new ParseEnumPipe(NavigationLocation))
    location: NavigationLocation,
    @Query('locale') localeRaw?: string,
  ) {
    const locale =
      localeRaw && Object.values(SiteLocale).includes(localeRaw as SiteLocale)
        ? (localeRaw as SiteLocale)
        : SiteLocale.en;
    return this.navigationService.findByLocation(location, locale);
  }

  @Get()
  findAllAdmin() {
    return this.navigationService.findAllAdmin();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNavigationItemDto) {
    return this.navigationService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.navigationService.remove(id);
  }
}
