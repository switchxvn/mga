import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { Logo } from './entities/logo.entity';
import { SettingsAdminService } from './admin/services/settings-admin.service';
import { SettingsFrontendService } from './frontend/services/settings-frontend.service';
import { SettingsAdminController } from './admin/controllers/admin.controller';
import { SettingsFrontendController } from './frontend/controllers/frontend.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([MenuItem, Logo]),
  ],
  controllers: [SettingsAdminController, SettingsFrontendController],
  providers: [SettingsAdminService, SettingsFrontendService],
  exports: [SettingsAdminService, SettingsFrontendService],
})
export class SettingsModule {} 