import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { ServiceAdminService } from './admin/services/service-admin.service';
import { ServiceFrontendService } from './frontend/services/service-frontend.service';
import { ServiceAdminController } from './admin/controllers/admin.controller';
import { ServiceFrontendController } from './frontend/controllers/frontend.controller';
import { ServiceSeedService } from './seed/service-seed.service';
import { ServiceSeedController } from './seed/seed.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Service])],
  controllers: [ServiceAdminController, ServiceFrontendController, ServiceSeedController],
  providers: [ServiceAdminService, ServiceFrontendService, ServiceSeedService],
  exports: [ServiceAdminService, ServiceFrontendService, ServiceSeedService],
})
export class ServiceModule {} 