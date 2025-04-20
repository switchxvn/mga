import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderFrontendService } from './frontend/services/order-frontend.service';
import { OrderAdminService } from './admin/services/order-admin.service';
import { PaymentGatewayModule } from '../payment-gateway/payment-gateway.module';
import { PaymentModule } from '../payment/payment.module';
import { MailModule } from '../mail/mail.module';
import { Product } from '../product/entities/product.entity';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product]),
    PaymentGatewayModule,
    forwardRef(() => PaymentModule),
    MailModule,
    UploadModule
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