import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Upload } from './entities/upload.entity';
import { UploadConfig } from './entities/upload-config.entity';
import { UploadAdminService } from './admin/services/upload-admin.service';
import { UploadFrontendService } from './frontend/services/upload-frontend.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Upload, UploadConfig]),
  ],
  providers: [
    UploadAdminService,
    UploadFrontendService,
  ],
  exports: [
    UploadAdminService,
    UploadFrontendService,
  ],
})
export class UploadModule {} 