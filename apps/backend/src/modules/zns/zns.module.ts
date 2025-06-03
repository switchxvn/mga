import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZnsConfiguration, ZnsTemplate, ZnsLog, ZnsWebhookEvent } from './entities';
import { ZnsService } from './services/zns.service';
import { ZnsWebhookService } from './services/zns-webhook.service';
import { ZnsNotificationService } from './services/zns-notification.service';
import { ZnsAdminService } from './admin/services/zns-admin.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ZnsConfiguration,
      ZnsTemplate,
      ZnsLog,
      ZnsWebhookEvent,
    ]),
  ],
  controllers: [],
  providers: [ZnsService, ZnsWebhookService, ZnsNotificationService, ZnsAdminService],
  exports: [ZnsService, ZnsWebhookService, ZnsNotificationService, ZnsAdminService],
})
export class ZnsModule {} 