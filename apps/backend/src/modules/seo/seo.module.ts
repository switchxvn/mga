import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seo } from './entities/seo.entity';
import { SeoAdminService } from './admin/services/seo-admin.service';
import { SeoFrontendService } from './frontend/services/seo-frontend.service';
import { SeoAdminController } from './admin/controllers/admin.controller';
import { SeoFrontendController } from './frontend/controllers/frontend.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Seo]),
  ],
  controllers: [SeoAdminController, SeoFrontendController],
  providers: [SeoAdminService, SeoFrontendService],
  exports: [SeoAdminService, SeoFrontendService],
})
export class SeoModule {} 