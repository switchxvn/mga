import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSession } from './entities/user-session.entity';
import { UserPageVisit } from './entities/user-page-visit.entity';
import { UserSessionAdminService } from './admin/services/user-session-admin.service';
import { UserSessionFrontendService } from './frontend/services/user-session-frontend.service';
import { UserPageVisitAdminService } from './admin/services/user-page-visit-admin.service';
import { UserPageVisitFrontendService } from './frontend/services/user-page-visit-frontend.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSession, UserPageVisit]),
  ],
  providers: [
    UserSessionAdminService,
    UserSessionFrontendService,
    UserPageVisitAdminService,
    UserPageVisitFrontendService,
  ],
  exports: [
    UserSessionAdminService,
    UserSessionFrontendService,
    UserPageVisitAdminService,
    UserPageVisitFrontendService,
  ],
})
export class UserSessionModule {} 