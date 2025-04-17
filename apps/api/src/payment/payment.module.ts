import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayOSWebhookController } from './controllers/payos-webhook.controller';
import { PayOSWebhookService } from './services/payos-webhook.service';
import { OrderModule } from '../../../backend/src/modules/order/order.module';
import { PaymentModule as BackendPaymentModule } from '../../../backend/src/modules/payment/payment.module';
import { PaymentMethod } from '../../../backend/src/modules/payment/entities/payment-method.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([PaymentMethod]),
    OrderModule,
    BackendPaymentModule
  ],
  controllers: [PayOSWebhookController],
  providers: [PayOSWebhookService],
})
export class PaymentModule {} 