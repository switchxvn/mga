import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentTransaction } from './entities/payment-transaction.entity';
import { PaymentAdminService } from './admin/services/payment-admin.service';
import { PaymentFrontendService } from './frontend/services/payment-frontend.service';
import { PaymentGatewayModule } from '../payment-gateway/payment-gateway.module';
import { MailModule } from '../mail/mail.module';
import { PayOSWebhookService } from './services/payos-webhook.service';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentMethod,
      PaymentTransaction
    ]),
    PaymentGatewayModule,
    MailModule,
    forwardRef(() => OrderModule)
  ],
  providers: [
    PaymentAdminService,
    PaymentFrontendService,
    PayOSWebhookService
  ],
  exports: [
    PaymentAdminService,
    PaymentFrontendService,
    PayOSWebhookService
  ]
})
export class PaymentModule {} 