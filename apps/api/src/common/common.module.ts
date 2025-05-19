import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiKeyGuard } from './guards/api-key.guard';
import { ApiKeyModule } from '../../../backend/src/modules/api-key/api-key.module';

@Module({
  imports: [
    ConfigModule,
    ApiKeyModule,
  ],
  providers: [ApiKeyGuard],
  exports: [ApiKeyGuard],
})
export class CommonModule {} 