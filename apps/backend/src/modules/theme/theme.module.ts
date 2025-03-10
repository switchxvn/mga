import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Theme } from './entities/theme.entity';
import { ThemeSection } from './entities/theme-section.entity';
import { ThemeAdminService } from './admin/services/theme-admin.service';
import { ThemeFrontendService } from './frontend/services/theme-frontend.service';
import { ThemeAdminController } from './admin/controllers/theme-admin.controller';
import { ThemeFrontendController } from './frontend/controllers/theme-frontend.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Theme, ThemeSection])
  ],
  controllers: [ThemeAdminController, ThemeFrontendController],
  providers: [ThemeAdminService, ThemeFrontendService],
  exports: [ThemeAdminService, ThemeFrontendService]
})
export class ThemeModule {} 