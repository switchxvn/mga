import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderRefund } from './entities/order-refund.entity';
import { OrderRefundItem } from './entities/order-refund-item.entity';
import { OrderTicketScanHistory } from './entities/order-ticket-scan-history.entity';
import { OrderFrontendService } from './frontend/services/order-frontend.service';
import { OrderAdminService } from './admin/services/order-admin.service';
import { PaymentGatewayModule } from '../payment-gateway/payment-gateway.module';
import { PaymentModule } from '../payment/payment.module';
import { MailModule } from '../mail/mail.module';
import { Product } from '../product/entities/product.entity';
import { UploadModule } from '../upload/upload.module';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderRefund,
      OrderRefundItem,
      OrderTicketScanHistory,
      Product,
    ]),
    forwardRef(() => PaymentGatewayModule),
    forwardRef(() => PaymentModule),
    MailModule,
    UploadModule,
    DashboardModule
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