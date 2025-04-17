import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { PayOSWebhookDto } from '../dtos/payos-webhook.dto';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PayOSException } from '../exceptions/payos.exception';
import { OrderAdminService } from '../../../../backend/src/modules/order/admin/services/order-admin.service';
import { PaymentFrontendService } from '../../../../backend/src/modules/payment/frontend/services/payment-frontend.service';
import { PaymentStatus } from '../../../../backend/src/modules/order/entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from '../../../../backend/src/modules/payment/entities/payment-method.entity';

@Injectable()
export class PayOSWebhookService {
  private readonly logger = new Logger(PayOSWebhookService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly orderAdminService: OrderAdminService,
    private readonly paymentFrontendService: PaymentFrontendService,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>
  ) {}

  async processWebhook(webhookData: PayOSWebhookDto): Promise<void> {
    try {
      // Skip processing if description is VQRIO123
      if (webhookData.data.description === 'VQRIO123') {
        this.logger.debug('Skipping webhook processing for VQRIO123');
        return;
      }

      // Get PayOS payment method config
      const payosMethod = await this.paymentMethodRepository.findOne({
        where: { code: 'PAYOS', is_active: true }
      });

      if (!payosMethod || !payosMethod.config?.checksumKey) {
        throw new PayOSException('PayOS configuration not found or invalid', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Log the webhook data for debugging
      this.logger.debug('Received webhook data:', webhookData);

      // Verify signature
      const isValid = await this.verifySignature(webhookData, payosMethod.config.checksumKey);
      if (!isValid) {
        this.logger.error('Invalid PayOS webhook signature');
        throw new PayOSException('Invalid webhook signature', HttpStatus.UNAUTHORIZED);
      }

      // Update payment transaction status
      const paymentTransaction = await this.paymentFrontendService.handlePaymentWebhook({
        order_id: webhookData.data.orderCode.toString(),
        status: webhookData.success ? 'PAID' : 'FAILED',
        metadata: {
          amount: webhookData.data.amount,
          reference: webhookData.data.reference,
          transaction_time: webhookData.data.transactionDateTime,
          payment_method_id: payosMethod.id,
          raw_webhook: webhookData
        }
      });

      if (!paymentTransaction) {
        return;
      }

      // Update order payment status
      const orderId = Number(paymentTransaction.order_id);
      if (isNaN(orderId)) {
        throw new PayOSException('Invalid order ID', HttpStatus.BAD_REQUEST);
      }

      // Map PayOS status to order payment status
      let orderPaymentStatus: PaymentStatus;
      if (webhookData.success) {
        orderPaymentStatus = PaymentStatus.PAID;
      } else {
        orderPaymentStatus = PaymentStatus.FAILED;
      }

      // Update order status
      await this.orderAdminService.updatePaymentStatus(orderId, orderPaymentStatus);

      this.logger.log('Successfully processed PayOS webhook', {
        orderId,
        paymentStatus: orderPaymentStatus,
        transactionId: paymentTransaction.id
      });
    } catch (error) {
      this.logger.error('Error processing webhook:', error);
      throw error;
    }
  }

  private sortObjDataByKey(object: Record<string, any>): Record<string, any> {
    const orderedObject = Object.keys(object)
      .sort()
      .reduce((obj, key) => {
        obj[key] = object[key];
        return obj;
      }, {} as Record<string, any>);
    return orderedObject;
  }

  private convertObjToQueryStr(object: Record<string, any>): string {
    return Object.keys(object)
      .filter((key) => object[key] !== undefined)
      .map((key) => {
        let value = object[key];
        // Sort nested object
        if (value && Array.isArray(value)) {
          value = JSON.stringify(value.map((val) => this.sortObjDataByKey(val)));
        }
        // Set empty string if null
        if ([null, undefined, 'undefined', 'null'].includes(value)) {
          value = '';
        }

        return `${key}=${value}`;
      })
      .join('&');
  }

  private async verifySignature(webhookData: PayOSWebhookDto, checksumKey: string): Promise<boolean> {
    try {
      const sortedDataByKey = this.sortObjDataByKey(webhookData.data);
      const dataQueryStr = this.convertObjToQueryStr(sortedDataByKey);
      
      // Add debug logging
      this.logger.debug('Data query string used for signature:', dataQueryStr);
      
      const signature = crypto
        .createHmac('sha256', checksumKey)
        .update(dataQueryStr)
        .digest('hex');
      
      this.logger.debug('Generated signature:', signature);
      this.logger.debug('Expected signature:', webhookData.signature);
      
      return signature === webhookData.signature;
    } catch (error) {
      this.logger.error('Error verifying signature:', error);
      throw new PayOSException('Error verifying webhook signature', HttpStatus.BAD_REQUEST);
    }
  }
} 