import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PublicSiteController } from './public-site.controller';
import { PublicSiteService } from './public-site.service';

@Module({
  imports: [PrismaModule],
  controllers: [PublicSiteController],
  providers: [PublicSiteService],
})
export class PublicSiteModule {}
