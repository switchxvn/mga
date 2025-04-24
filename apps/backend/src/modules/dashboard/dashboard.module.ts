import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardStats } from './entities/dashboard-stats.entity';
import { DashboardAdminService } from './admin/services/dashboard-admin.service';
import { DashboardFrontendService } from './frontend/services/dashboard-frontend.service';
import { DashboardStatsService } from './services/dashboard-stats.service';
import { Order } from '../order/entities/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DashboardStats, Order])
  ],
  providers: [
    DashboardAdminService,
    DashboardFrontendService,
    DashboardStatsService
  ],
  exports: [
    DashboardAdminService,
    DashboardFrontendService,
    DashboardStatsService
  ]
})
export class DashboardModule {} 