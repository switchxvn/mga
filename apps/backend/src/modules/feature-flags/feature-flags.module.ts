import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureFlag } from './entities/feature-flag.entity';
import { FeatureFlagsAdminService } from './admin/services/feature-flags-admin.service';
import { FeatureFlagsFrontendService } from './frontend/services/feature-flags-frontend.service';
import { FeatureFlagsAdminController } from './admin/controllers/admin.controller';
import { FeatureFlagsFrontendController } from './frontend/controllers/frontend.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeatureFlag]),
  ],
  controllers: [FeatureFlagsAdminController, FeatureFlagsFrontendController],
  providers: [FeatureFlagsAdminService, FeatureFlagsFrontendService],
  exports: [FeatureFlagsAdminService, FeatureFlagsFrontendService],
})
export class FeatureFlagsModule {} 