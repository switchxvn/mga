import { Injectable, Logger, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { PayOSException } from '../exceptions/payos.exception';
import { OrderAdminService } from '../../order/admin/services/order-admin.service';
import { PaymentFrontendService } from '../frontend/services/payment-frontend.service';
import { PaymentStatus } from '@ew/shared';
import { PaymentMethod } from '../entities/payment-method.entity';
import { MailService } from '../../mail/services/mail.service';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ProductTranslation } from '../../product/entities/product-translation.entity';
import { OrderFrontendService } from '../../order/frontend/services/order-frontend.service';

@Injectable()
export class PayOSWebhookService {
  private readonly logger = new Logger(PayOSWebhookService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly orderAdminService: OrderAdminService,
    private readonly paymentFrontendService: PaymentFrontendService,
    private readonly mailService: MailService,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
    private readonly orderFrontendService: OrderFrontendService
  ) {}

  async processWebhook(webhookData: any): Promise<void> {
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
        order_id: webhookData.data.orderCode,
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
      const order = await this.orderFrontendService.findOrderByCode(webhookData.data.orderCode);
      if (!order) {
        throw new PayOSException('Order not found', HttpStatus.BAD_REQUEST);
      }

      // Map PayOS status to order payment status
      let orderPaymentStatus: PaymentStatus;
      if (webhookData.success) {
        orderPaymentStatus = PaymentStatus.PAID;
      } else {
        orderPaymentStatus = PaymentStatus.FAILED;
      }

      // Update order status
      const updatedOrder = await this.orderAdminService.updatePaymentStatus(order.id, orderPaymentStatus);

      // Send email notification if payment is successful
      if (webhookData.success && updatedOrder) {
        try {
          // Get the first ticket from the order
          const firstTicket = updatedOrder.items[0];
          if (!firstTicket) {
            this.logger.warn('No items found in order', { orderId: updatedOrder.id });
            return;
          }

          // Get product translations
          const productTranslation = firstTicket.product?.translations?.[0] as ProductTranslation;

          // Format event date and time
          const eventDateTime = new Date(firstTicket.createdAt);
          const eventDate = format(eventDateTime, 'dd/MM/yyyy', { locale: vi });
          const eventTime = format(eventDateTime, 'HH:mm', { locale: vi });

          // Prepare email data
          const emailData = {
            customerName: order.customerName || 'Quý khách',
            eventName: productTranslation.title || 'Vé tham quan',
            eventDate: eventDate,
            eventTime: eventTime,
            eventLocation: productTranslation?.content || 'Địa điểm sự kiện',
            ticketType: 'Vé thường',
            ticketNumber: firstTicket.qrCode,
            ticketPrice: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(firstTicket.unitPrice),
            qrCodeUrl: firstTicket.imageQrCode || this.configService.get('DEFAULT_QR_IMAGE', 'https://example.com/qr-placeholder.png'),
            venueAddress: this.configService.get('VENUE_ADDRESS', 'Địa chỉ venue'),
            supportEmail: this.configService.get('SUPPORT_EMAIL', 'support@yourdomain.com'),
            supportPhone: this.configService.get('SUPPORT_PHONE', '1900 xxxx'),
            orderCode: order.orderCode
          };

          // Send email
          await this.mailService.sendMail({
            to: updatedOrder.email,
            subject: `Vé điện tử cho ${emailData.eventName} - Mã đơn hàng #${order.orderCode}`,
            template: {
              id: 'TICKET_QR_CODE_VI',
              data: emailData
            }
          });

          this.logger.log('Successfully sent ticket confirmation email', {
            orderId: updatedOrder.id,
            customerEmail: updatedOrder.email
          });
        } catch (error) {
          this.logger.error('Error sending ticket confirmation email:', error);
          // Don't throw the error to prevent webhook processing failure
        }
      }

      this.logger.log('Successfully processed PayOS webhook', {
        orderId: updatedOrder.id,
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

  private async verifySignature(webhookData: any, checksumKey: string): Promise<boolean> {
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