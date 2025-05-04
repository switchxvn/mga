import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteStatisticsAdminService } from './admin/services/site-statistics-admin.service';
import { SiteStatisticsFrontendService } from './frontend/services/site-statistics-frontend.service';
import { SiteStatistics, SiteStatisticsHistory, SiteStatisticsSettings, SiteStatisticsTranslation } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SiteStatistics,
      SiteStatisticsHistory,
      SiteStatisticsTranslation,
      SiteStatisticsSettings,
    ]),
  ],
  providers: [
    SiteStatisticsAdminService,
    SiteStatisticsFrontendService,
  ],
  exports: [
    SiteStatisticsAdminService,
    SiteStatisticsFrontendService,
  ],
})
export class SiteStatisticsModule {} 