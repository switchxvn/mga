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
  private clientId: string;
  private apiKey: string;

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
      this.clientId = clientId;
      this.apiKey = apiKey;
      this.payos = new PayOS(clientId, apiKey, checksumKey);

      this.logger.debug('PayOS initialized with config:', {
        clientId,
        apiKey: '***' + apiKey.slice(-4),
        checksumKey: '***' + checksumKey.slice(-4)
      });
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
      
      this.logger.debug('PayOS createPayment response:', paymentLink);

      if (!paymentLink?.checkoutUrl) {
        this.logger.error('Invalid PayOS Response Format:', paymentLink);
        throw new PaymentException('Invalid response format from PayOS');
      }

      return {
        payment_url: paymentLink.checkoutUrl,
        qr_code: paymentLink.qrCode,
        metadata: {
          orderCode: String(paymentLink.orderCode),
          paymentLinkId: paymentLink.paymentLinkId,
          status: paymentLink.status,
          accountNumber: paymentLink.accountNumber,
          accountName: paymentLink.accountName,
          bin: paymentLink.bin
        },
      };
    } catch (error) {
      this.logger.error(`Failed to create payment: ${error.message}`, error.stack);
      throw new PaymentException(error.message);
    }
  }

  private generateSignature(data: Record<string, any>): string {
    try {
      // According to PayOS docs, signature must be generated from these fields in alphabetical order
      const signatureString = [
        `amount=${data.amount}`,
        `cancelUrl=${data.cancelUrl}`,
        `description=${data.description}`,
        `orderCode=${data.orderCode}`,
        `returnUrl=${data.returnUrl}`
      ].join('&');

      this.logger.debug('Generating signature for string:', signatureString);

      const signature = crypto
        .createHmac('sha256', this.checksumKey)
        .update(signatureString)
        .digest('hex');

      this.logger.debug('Generated signature:', signature);
      return signature;
    } catch (error) {
      this.logger.error('Failed to generate signature:', error);
      throw new PaymentException('Failed to generate signature');
    }
  }

  private async createPaymentLink(request: CreatePaymentRequest): Promise<PayOSPaymentLinkResponse> {
    try {
      // Generate a unique orderCode by combining order_id with timestamp
      const baseOrderCode = Number(request.order_id);
      if (isNaN(baseOrderCode) || baseOrderCode <= 0 || baseOrderCode > Number.MAX_SAFE_INTEGER) {
        throw new PaymentException('Invalid order code');
      }
      

      const amount = Math.round(request.amount);
      if (amount < 1000) {
        throw new PaymentException('Amount must be at least 1000 VND');
      }

      // Prepare payment data according to PayOS requirements
      const paymentData = {
        orderCode: baseOrderCode,
        amount,
        description: request.description || `Payment for order ${baseOrderCode}`,
        cancelUrl: request.cancel_url,
        returnUrl: request.return_url,
        // Optional buyer information
        ...(request.buyer_name && { buyerName: request.buyer_name }),
        ...(request.buyer_email && { buyerEmail: request.buyer_email }),
        ...(request.buyer_phone && { buyerPhone: request.buyer_phone }),
        ...(request.buyer_address && { buyerAddress: request.buyer_address }),
        // Optional items
        ...(request.items && { items: request.items }),
        // Optional expiry (24 hours from now)
        expiredAt: Math.floor(Date.now() / 1000) + 24 * 60 * 60
      };

      this.logger.debug('PayOS payment request data:', {
        ...paymentData,
        clientId: this.clientId,
        apiKey: '***' + this.apiKey.slice(-4)
      });

      // Generate signature
      const signature = this.generateSignature(paymentData);

      // Create payment link with PayOS
      try {
        const headers = {
          'x-client-id': this.clientId,
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json'
        };

        this.logger.debug('PayOS API request:', {
          data: { ...paymentData, signature },
          headers: { ...headers, 'x-api-key': '***' + this.apiKey.slice(-4) }
        });

        const response = await this.payos.createPaymentLink({
          ...paymentData,
          signature,
        });

        this.logger.debug('PayOS API response:', response);

        if (!response || typeof response !== 'object') {
          throw new PaymentException('Invalid response from PayOS');
        }

        return response;
      } catch (error) {
        this.logger.error('PayOS API Error:', {
          error: error.message,
          stack: error.stack,
          response: error.response?.data
        });
        throw new PaymentException(error.message || 'Failed to create payment link');
      }
    } catch (error) {
      this.logger.error(`Failed to create payment link: ${error.message}`, error.stack);
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
} 