import { Module } from '@nestjs/common';
import { RevalidationModule } from '../revalidation/revalidation.module';
import { CatalogService } from './catalog.service';
import { ServicesController } from './services.controller';

@Module({
  imports: [RevalidationModule],
  controllers: [ServicesController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class ServicesModule {}
