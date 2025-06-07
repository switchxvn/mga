import { Module } from '@nestjs/common';
import { ZnsModule as BackendZnsModule } from '../../../backend/src/modules/zns/zns.module';
import { ZnsWebhookController } from './controllers/zns-webhook.controller';
import { CommonModule } from '../common/common.module';
import { ApiKeyModule } from '../../../backend/src/modules/api-key/api-key.module';

@Module({
  imports: [
    BackendZnsModule,
    CommonModule,
    ApiKeyModule,
  ],
  controllers: [ZnsWebhookController],
  exports: [],
})
export class ZnsModule {} 