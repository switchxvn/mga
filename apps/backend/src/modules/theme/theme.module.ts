import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Theme } from './entities/theme.entity';
import { ThemeSection } from './entities/theme-section.entity';
import { ComponentStyleConfig } from './entities/component-style-config.entity';
import { ThemeAdminService } from './admin/services/theme-admin.service';
import { ThemeFrontendService } from './frontend/services/theme-frontend.service';
import { ThemeAdminController } from './admin/controllers/theme-admin.controller';
import { ThemeFrontendController } from './frontend/controllers/theme-frontend.controller';
import { ComponentStyleConfigAdminService } from './admin/services/component-style-config-admin.service';
import { ComponentStyleConfigFrontendService } from './frontend/services/component-style-config-frontend.service';
import { ThemeSectionAdminService } from './admin/services/theme-section-admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Theme, ThemeSection, ComponentStyleConfig])
  ],
  controllers: [ThemeAdminController, ThemeFrontendController],
  providers: [
    ThemeAdminService, 
    ThemeFrontendService, 
    ComponentStyleConfigAdminService, 
    ComponentStyleConfigFrontendService,
    ThemeSectionAdminService
  ],
  exports: [
    ThemeAdminService, 
    ThemeFrontendService, 
    ComponentStyleConfigAdminService, 
    ComponentStyleConfigFrontendService,
    ThemeSectionAdminService
  ]
})
export class ThemeModule {} 