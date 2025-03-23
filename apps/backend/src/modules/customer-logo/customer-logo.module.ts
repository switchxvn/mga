import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerLogo } from './entities/customer-logo.entity';
import { CustomerLogoAdminService } from './admin/services/customer-logo-admin.service';
import { CustomerLogoFrontendService } from './frontend/services/customer-logo-frontend.service';
import { CustomerLogoAdminController } from './admin/controllers/customer-logo-admin.controller';
import { CustomerLogoFrontendController } from './frontend/controllers/customer-logo-frontend.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerLogo])],
  controllers: [CustomerLogoAdminController, CustomerLogoFrontendController],
  providers: [CustomerLogoAdminService, CustomerLogoFrontendService],
  exports: [CustomerLogoAdminService, CustomerLogoFrontendService],
})
export class CustomerLogoModule {} 