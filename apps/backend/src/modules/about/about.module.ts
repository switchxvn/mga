import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutPage } from './entities/about-page.entity';
import { AboutSection } from './entities/about-section.entity';
import { AboutTeamMember } from './entities/about-team-member.entity';
import { AboutMilestone } from './entities/about-milestone.entity';
import { AboutPageTranslation } from './entities/about-page-translation.entity';
import { AboutSectionTranslation } from './entities/about-section-translation.entity';
import { AboutTeamMemberTranslation } from './entities/about-team-member-translation.entity';
import { AboutMilestoneTranslation } from './entities/about-milestone-translation.entity';
import { AboutAdminController } from './admin/controllers/admin.controller';
import { AboutFrontendController } from './frontend/controllers/frontend.controller';
import { AboutAdminService } from './admin/services/about-admin.service';
import { AboutFrontendService } from './frontend/services/about-frontend.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AboutPage,
      AboutSection,
      AboutTeamMember,
      AboutMilestone,
      AboutPageTranslation,
      AboutSectionTranslation,
      AboutTeamMemberTranslation,
      AboutMilestoneTranslation
    ])
  ],
  controllers: [AboutAdminController, AboutFrontendController],
  providers: [AboutAdminService, AboutFrontendService],
  exports: [AboutAdminService, AboutFrontendService]
})
export class AboutModule {} 