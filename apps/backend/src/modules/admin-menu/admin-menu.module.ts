import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminMenuItem } from './entities/admin-menu-item.entity';
import { AdminMenuAdminService } from './admin/services/admin-menu-admin.service';
import { AdminMenuFrontendService } from './frontend/services/admin-menu-frontend.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminMenuItem])
  ],
  controllers: [],
  providers: [
    AdminMenuAdminService,
    AdminMenuFrontendService
  ],
  exports: [AdminMenuAdminService, AdminMenuFrontendService]
})
export class AdminMenuModule {} 