import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentTransaction } from './entities/payment-transaction.entity';
import { PaymentAdminService } from './admin/services/payment-admin.service';
import { PaymentFrontendService } from './frontend/services/payment-frontend.service';
import { PaymentGatewayModule } from '../payment-gateway/payment-gateway.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentMethod,
      PaymentTransaction
    ]),
    PaymentGatewayModule
  ],
  providers: [
    PaymentAdminService,
    PaymentFrontendService
  ],
  exports: [
    PaymentAdminService,
    PaymentFrontendService
  ]
})
export class PaymentModule {} 