import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PayOS = require('@payos/node');
import {
  CreatePaymentRequest,
  PaymentGatewayInterface,
  PaymentResponse,
  PayOSWebhookData,
  PayOSPaymentLinkResponse,
} from '../interfaces/payment-gateway.interface';
import { PaymentException } from '../exceptions/payment.exception';
import { PaymentMethod } from '../../payment/entities/payment-method.entity';

@Injectable()
export class PayOSService implements PaymentGatewayInterface {
  private payos: any;
  private readonly logger = new Logger(PayOSService.name);

  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>
  ) {}

  private async initializePayOS(): Promise<void> {
    try {
      const payosMethod = await this.paymentMethodRepository.findOne({
        where: { code: 'PAYOS', is_active: true }
      });

      if (!payosMethod || !payosMethod.config) {
        throw new PaymentException('PayOS configuration not found or inactive');
      }

      const { clientId, apiKey, checksumKey } = payosMethod.config;

      if (!clientId || !apiKey || !checksumKey) {
        throw new PaymentException('Invalid PayOS configuration');
      }

      this.payos = new PayOS(clientId, apiKey, checksumKey);
    } catch (error) {
      this.logger.error(`Failed to initialize PayOS: ${error.message}`, error.stack);
      throw new PaymentException('Failed to initialize payment gateway');
    }
  }

  async createPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      if (!this.payos) {
        await this.initializePayOS();
      }

      if (request.amount < 1000) {
        throw new PaymentException('Amount must be at least 1000 VND');
      }

      const paymentLink = await this.createPaymentLink(request);

      return {
        payment_url: paymentLink.data.checkoutUrl,
        qr_code: paymentLink.data.qrCode,
        metadata: {
          orderCode: paymentLink.data.orderCode,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to create payment: ${error.message}`, error.stack);
      throw new PaymentException(error.message);
    }
  }

  async verifyPayment(webhookData: any, signature: string): Promise<boolean> {
    try {
      if (!this.payos) {
        await this.initializePayOS();
      }

      const isValidSignature = this.payos.validateWebhookSignature(webhookData, signature);
      if (!isValidSignature) {
        throw new PaymentException('Invalid webhook signature');
      }

      const paymentStatus = webhookData.data.payment.status;
      return paymentStatus === 'PAID';
    } catch (error) {
      this.logger.error(`Failed to verify payment: ${error.message}`, error.stack);
      throw new PaymentException(error.message);
    }
  }

  private async createPaymentLink(request: CreatePaymentRequest): Promise<PayOSPaymentLinkResponse> {
    try {
      const response = await this.payos.createPaymentLink({
        orderCode: request.order_id,
        amount: request.amount,
        description: request.description || `Payment for order ${request.order_id}`,
        cancelUrl: request.cancel_url,
        returnUrl: request.return_url,
      });

      return response;
    } catch (error) {
      this.logger.error(`Failed to create payment link: ${error.message}`, error.stack);
      throw new PaymentException(error.message);
    }
  }
} 