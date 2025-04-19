import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderFrontendService } from './frontend/services/order-frontend.service';
import { OrderAdminService } from './admin/services/order-admin.service';
import { PaymentGatewayModule } from '../payment-gateway/payment-gateway.module';
import { PaymentModule } from '../payment/payment.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    PaymentGatewayModule,
    forwardRef(() => PaymentModule),
    MailModule
  ],
  providers: [
    OrderFrontendService,
    OrderAdminService
  ],
  exports: [
    OrderFrontendService,
    OrderAdminService
  ]
})
export class OrderModule {} 