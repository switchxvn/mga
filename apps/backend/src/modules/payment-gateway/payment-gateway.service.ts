import { Injectable } from '@nestjs/common';
import { PaymentGatewayInterface, CreatePaymentRequest, PaymentResponse } from './interfaces/payment-gateway.interface';

@Injectable()
export abstract class PaymentGatewayService implements PaymentGatewayInterface {
  abstract createPayment(request: CreatePaymentRequest): Promise<PaymentResponse>;
  abstract verifyPayment(payload: any): Promise<boolean>;
} 