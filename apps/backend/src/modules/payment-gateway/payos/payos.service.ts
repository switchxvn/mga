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
import * as crypto from 'crypto';

@Injectable()
export class PayOSService implements PaymentGatewayInterface {
  private payos: any;
  private readonly logger = new Logger(PayOSService.name);
  private checksumKey: string;

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

      this.checksumKey = checksumKey;
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
      
      if (!paymentLink?.data?.checkoutUrl) {
        this.logger.error('Invalid PayOS response:', paymentLink);
        throw new PaymentException('Invalid response from PayOS');
      }

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

  private generateSignature(data: Record<string, any>): string {
    // Sort keys alphabetically
    const sortedKeys = Object.keys(data).sort();
    
    // Create signature string
    const signatureString = sortedKeys
      .filter(key => data[key] !== undefined && data[key] !== null && key !== 'signature')
      .map(key => `${key}=${data[key]}`)
      .join('&');

    // Generate HMAC SHA256
    return crypto
      .createHmac('sha256', this.checksumKey)
      .update(signatureString)
      .digest('hex');
  }

  private async createPaymentLink(request: CreatePaymentRequest): Promise<PayOSPaymentLinkResponse> {
    try {
      const orderCode = Number(request.order_id);
      if (isNaN(orderCode) || orderCode <= 0 || orderCode > Number.MAX_SAFE_INTEGER) {
        throw new PaymentException('Invalid order code');
      }

      const amount = Math.round(request.amount);
      if (amount < 1000) {
        throw new PaymentException('Amount must be at least 1000 VND');
      }

      // Prepare payment data according to PayOS requirements
      const paymentData = {
        orderCode,
        amount,
        description: request.description || `Payment for order ${orderCode}`,
        cancelUrl: request.cancel_url,
        returnUrl: request.return_url,
      };

      // Generate signature
      const signature = this.generateSignature(paymentData);

      // Create payment link with PayOS
      try {
        const response = await this.payos.createPaymentLink({
          ...paymentData,
          signature,
        });

        this.logger.debug('PayOS Response:', response);

        if (!response?.data) {
          throw new PaymentException('Invalid response format from PayOS');
        }

        return response;
      } catch (error) {
        this.logger.error('PayOS API Error:', error);
        throw new PaymentException(error.message || 'Failed to create payment link');
      }
    } catch (error) {
      this.logger.error(`Failed to create payment link: ${error.message}`, error.stack);
      throw new PaymentException(error.message);
    }
  }
} 