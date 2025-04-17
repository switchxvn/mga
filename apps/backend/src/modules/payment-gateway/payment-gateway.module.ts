import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PayOSService } from './payos/payos.service';
import { PaymentGatewayService } from './payment-gateway.service';
import { PaymentMethod } from '../payment/entities/payment-method.entity';

export const PAYMENT_GATEWAY_TOKEN = 'PAYMENT_GATEWAY_TOKEN';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([PaymentMethod])
  ],
  providers: [
    PayOSService,
    PaymentGatewayService,
    {
      provide: PAYMENT_GATEWAY_TOKEN,
      useClass: PaymentGatewayService
    }
  ],
  exports: [PAYMENT_GATEWAY_TOKEN]
})
export class PaymentGatewayModule {} 