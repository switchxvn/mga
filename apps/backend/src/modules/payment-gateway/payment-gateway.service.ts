import { Injectable } from '@nestjs/common';
import { PayOSService } from './payos/payos.service';
import { CreatePaymentRequest, PaymentResponse } from './interfaces/payment-gateway.interface';

@Injectable()
export class PaymentGatewayService {
  constructor(private readonly payosService: PayOSService) {}

  async createPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    return this.payosService.createPayment(request);
  }

  async verifyPayment(webhookData: any, signature: string): Promise<boolean> {
    return this.payosService.verifyPayment(webhookData, signature);
  }
} 