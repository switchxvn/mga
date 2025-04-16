import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PayOSService } from './payos/payos.service';
import { PaymentGatewayService } from './payment-gateway.service';

@Module({
  imports: [ConfigModule],
  providers: [
    PayOSService,
    {
      provide: PaymentGatewayService,
      useClass: PayOSService // We can easily switch to another payment gateway by changing this
    }
  ],
  exports: [PaymentGatewayService]
})
export class PaymentGatewayModule {} 