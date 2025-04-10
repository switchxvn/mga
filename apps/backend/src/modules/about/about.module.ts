import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutSection } from './entities/about-section.entity';
import { AboutSectionTranslation } from './entities/about-section-translation.entity';
import { AboutAdminController } from './admin/controllers/admin.controller';
import { AboutFrontendController } from './frontend/controllers/frontend.controller';
import { AboutAdminService } from './admin/services/about-admin.service';
import { AboutFrontendService } from './frontend/services/about-frontend.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AboutSection,
      AboutSectionTranslation
    ])
  ],
  controllers: [AboutAdminController, AboutFrontendController],
  providers: [AboutAdminService, AboutFrontendService],
  exports: [AboutAdminService, AboutFrontendService]
})
export class AboutModule {} 