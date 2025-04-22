import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardStats } from './entities/dashboard-stats.entity';
import { DashboardAdminService } from './admin/services/dashboard-admin.service';
import { DashboardFrontendService } from './frontend/services/dashboard-frontend.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DashboardStats])
  ],
  providers: [
    DashboardAdminService,
    DashboardFrontendService
  ],
  exports: [
    DashboardAdminService,
    DashboardFrontendService,
  ]
})
export class DashboardModule {} 