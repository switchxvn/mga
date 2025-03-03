import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile, CountryPhoneCode } from '@ew/database';
import { ProfileService } from './services/profile.service';
import { ProfileAdminController } from './admin/controllers/admin.controller';
import { ProfileFrontendController } from './frontend/controllers/frontend.controller';
import { ProfileAdminService } from './admin/services/profile-admin.service';
import { ProfileFrontendService } from './frontend/services/profile-frontend.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserProfile, CountryPhoneCode]),
  ],
  controllers: [ProfileAdminController, ProfileFrontendController],
  providers: [ProfileService, ProfileAdminService, ProfileFrontendService],
  exports: [ProfileService, ProfileAdminService, ProfileFrontendService],
})
export class ProfileModule {} 