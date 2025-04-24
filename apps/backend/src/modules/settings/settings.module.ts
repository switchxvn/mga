import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { Logo } from './entities/logo.entity';
import { Tag } from './entities/tag.entity';
import { PostTag } from '../post/entities/post-tag.entity';
import { Settings } from './entities/settings.entity';
import { SettingsAdminService } from './admin/services/settings-admin.service';
import { SettingsFrontendService } from './frontend/services/settings-frontend.service';
import { SettingsAdminController } from './admin/controllers/admin.controller';
import { SettingsFrontendController } from './frontend/controllers/frontend.controller';
import { MenuItemTranslation } from './entities/menu-item-translation.entity';
import { LogoAdminService } from './admin/services/logo-admin.service';
import { LogoFrontendService } from './frontend/services/logo-frontend.service';
import { SettingsService } from './services/settings.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([MenuItem, Logo, Tag, PostTag, Settings, MenuItemTranslation]),
  ],
  controllers: [SettingsAdminController, SettingsFrontendController],
  providers: [SettingsAdminService, SettingsFrontendService, LogoAdminService, LogoFrontendService, SettingsService],
  exports: [SettingsAdminService, SettingsFrontendService, LogoAdminService, LogoFrontendService, SettingsService],
})
export class SettingsModule {} 