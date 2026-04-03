import { Module } from '@nestjs/common';
import { StudioAnalyticsAggregationService } from './studio-analytics-aggregation.service';
import { StudioAnalyticsController } from './studio-analytics.controller';
import { StudioAnalyticsService } from './studio-analytics.service';

@Module({
  controllers: [StudioAnalyticsController],
  providers: [StudioAnalyticsService, StudioAnalyticsAggregationService],
  exports: [StudioAnalyticsService, StudioAnalyticsAggregationService],
})
export class StudioAnalyticsModule {}
