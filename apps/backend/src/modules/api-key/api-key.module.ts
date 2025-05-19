import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from './entities/api-key.entity';
import { ApiKeyAdminService } from './admin/services/api-key-admin.service';
import { ApiKeyFrontendService } from './frontend/services/api-key-frontend.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiKey]),
  ],
  providers: [
    ApiKeyAdminService,
    ApiKeyFrontendService,
  ],
  exports: [
    ApiKeyAdminService,
    ApiKeyFrontendService,
  ],
})
export class ApiKeyModule {} 