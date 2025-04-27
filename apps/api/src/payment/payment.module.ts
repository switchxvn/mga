import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayOSWebhookController } from './controllers/payos-webhook.controller';
import { PayOSWebhookService } from './services/payos-webhook.service';
import { OrderModule } from '../../../../apps/backend/src/modules/order/order.module';
import { PaymentModule as BackendPaymentModule } from '../../../../apps/backend/src/modules/payment/payment.module';
import { PaymentMethod } from '../../../../apps/backend/src/modules/payment/entities/payment-method.entity';
import { UploadModule } from '../../../../apps/backend/src/modules/upload/upload.module';
import { MailModule } from '../../../../apps/backend/src/modules/mail/mail.module';
import { DashboardModule } from '../../../../apps/backend/src/modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([PaymentMethod]),
    OrderModule,
    BackendPaymentModule,
    UploadModule,
    MailModule,
    DashboardModule,
  ],
  controllers: [PayOSWebhookController],
  providers: [PayOSWebhookService],
})
export class PaymentModule {} 