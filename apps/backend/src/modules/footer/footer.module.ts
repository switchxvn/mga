import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Footer } from './entities/footer.entity';
import { FooterAdminService } from './admin/services/footer-admin.service';
import { FooterFrontendService } from './frontend/services/footer-frontend.service';
import { FooterAdminController } from './admin/controllers/admin.controller';
import { FooterFrontendController } from './frontend/controllers/frontend.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Footer]),
  ],
  controllers: [FooterAdminController, FooterFrontendController],
  providers: [FooterAdminService, FooterFrontendService],
  exports: [FooterAdminService, FooterFrontendService],
})
export class FooterModule {} 