import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderFrontendService } from './frontend/services/order-frontend.service';
import { OrderAdminService } from './admin/services/order-admin.service';
import { PaymentGatewayModule } from '../payment-gateway/payment-gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    PaymentGatewayModule
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