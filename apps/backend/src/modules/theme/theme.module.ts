import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Theme } from './entities/theme.entity';
import { ThemeSection } from './entities/theme-section.entity';
import { ThemeSectionTranslation } from './entities/theme-section-translation.entity';
import { ComponentStyleConfig } from './entities/component-style-config.entity';
import { ThemeAdminService } from './admin/services/theme-admin.service';
import { ThemeFrontendService } from './frontend/services/theme-frontend.service';
import { ThemeAdminController } from './admin/controllers/theme-admin.controller';
import { ThemeFrontendController } from './frontend/controllers/theme-frontend.controller';
import { ComponentStyleConfigAdminService } from './admin/services/component-style-config-admin.service';
import { ComponentStyleConfigFrontendService } from './frontend/services/component-style-config-frontend.service';
import { ThemeSectionAdminService } from './admin/services/theme-section-admin.service';
import { ThemeSectionFrontendService } from './frontend/services/theme-section-frontend.service';
import { ThemeSectionAdminController } from './admin/controllers/theme-section-admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Theme, ThemeSection, ThemeSectionTranslation, ComponentStyleConfig])
  ],
  controllers: [
    ThemeAdminController,
    ThemeFrontendController,
    ThemeSectionAdminController
  ],
  providers: [
    ThemeAdminService, 
    ThemeFrontendService, 
    ComponentStyleConfigAdminService, 
    ComponentStyleConfigFrontendService,
    ThemeSectionAdminService,
    ThemeSectionFrontendService
  ],
  exports: [
    ThemeAdminService, 
    ThemeFrontendService, 
    ComponentStyleConfigAdminService, 
    ComponentStyleConfigFrontendService,
    ThemeSectionAdminService,
    ThemeSectionFrontendService
  ]
})
export class ThemeModule {} 