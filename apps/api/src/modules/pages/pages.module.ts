import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { RevalidationModule } from '../revalidation/revalidation.module';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';

@Module({
  imports: [MediaModule, RevalidationModule],
  controllers: [PagesController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}
