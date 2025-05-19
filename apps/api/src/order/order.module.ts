import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { OrderController } from './controllers/order.controller';
import { OrderService } from './services/order.service';
import { OrderModule as BackendOrderModule } from '../../../backend/src/modules/order/order.module';
import { Order } from '../../../backend/src/modules/order/entities/order.entity';
import { OrderItem } from '../../../backend/src/modules/order/entities/order-item.entity';
import { PaymentModule as BackendPaymentModule } from '../../../backend/src/modules/payment/payment.module';
import { MailModule } from '../../../backend/src/modules/mail/mail.module';
import { TicketModule } from '../ticket/ticket.module';
import { CommonModule } from '../common/common.module';
import { ApiKeyModule } from '../../../backend/src/modules/api-key/api-key.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Order, OrderItem]),
    BackendOrderModule,
    BackendPaymentModule,
    CommonModule,
    MailModule,
    TicketModule,
    ApiKeyModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {} 