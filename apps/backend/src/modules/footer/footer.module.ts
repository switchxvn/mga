import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Footer } from './entities/footer.entity';
import { FooterAdminService } from './admin/services/footer-admin.service';
import { FooterFrontendService } from './frontend/services/footer-frontend.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Footer]),
  ],
  controllers: [],
  providers: [FooterAdminService, FooterFrontendService],
  exports: [FooterAdminService, FooterFrontendService],
})
export class FooterModule {} 