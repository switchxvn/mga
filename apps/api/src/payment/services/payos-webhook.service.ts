import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import * as QRCode from 'qrcode';
import { Repository } from 'typeorm';
import { MailService } from '../../../../backend/src/modules/mail/services/mail.service';
import { OrderAdminService } from '../../../../backend/src/modules/order/admin/services/order-admin.service';
import { PaymentStatus } from '../../../../backend/src/modules/order/entities/order.entity';
import { PaymentMethod } from '../../../../backend/src/modules/payment/entities/payment-method.entity';
import { PaymentFrontendService } from '../../../../backend/src/modules/payment/frontend/services/payment-frontend.service';
import { UploadFrontendService } from '../../../../backend/src/modules/upload/frontend/services/upload-frontend.service';
import { PayOSWebhookDto } from '../dtos/payos-webhook.dto';
import { PayOSException } from '../exceptions/payos.exception';
import fetch from 'node-fetch';
import { Readable } from 'stream';

@Injectable()
export class PayOSWebhookService {
  private readonly logger = new Logger(PayOSWebhookService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly orderAdminService: OrderAdminService,
    private readonly paymentFrontendService: PaymentFrontendService,
    private readonly mailService: MailService,
    private readonly uploadFrontendService: UploadFrontendService,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>
  ) {}

  private async generateAndUploadQRCode(text: string, orderId: number): Promise<string> {
    try {
      // Generate QR code as buffer
      const qrBuffer = await QRCode.toBuffer(text, {
        type: 'png',
        width: 200,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      // Create filename
      const filename = `qr-${orderId}-${Date.now()}.png`;

      // Get presigned URL for upload
      const result = await this.uploadFrontendService.getPresignedUrl({
        filename,
        mimeType: 'image/png',
        size: qrBuffer.length,
      });

      // Create readable stream from buffer
      const stream = new Readable();
      stream.push(qrBuffer);
      stream.push(null);

      // Upload using node-fetch with stream
      const response = await fetch(result.presignedUrl, {
        method: 'PUT',
        body: stream,
        headers: {
          'Content-Type': 'image/png',
          'Content-Length': qrBuffer.length.toString(),
          'x-amz-acl': 'public-read',
        },
      });

      if (!response.ok) {
        this.logger.error('Failed to upload QR code', {
          statusCode: response.status,
          statusText: response.statusText,
          orderId,
          filename
        });
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      this.logger.debug('Successfully uploaded QR code', {
        filename,
        url: result.url,
        size: qrBuffer.length
      });

      return result.url;
    } catch (error) {
      this.logger.error('Error in generateAndUploadQRCode:', {
        error: error.message,
        orderId,
        stack: error.stack
      });
      throw new PayOSException('Failed to generate and upload QR code', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

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
      const order = await this.orderAdminService.updatePaymentStatus(orderId, orderPaymentStatus);

      // Send email notification if payment is successful
      if (webhookData.success && order) {
        try {
          if (!order.items?.length) {
            this.logger.warn('No items found in order', { orderId });
            return;
          }

          // Group items by product for better organization
          const itemsByProduct = order.items.reduce((acc, item) => {
            const productId = item.productSnapshot?.id;
            if (!productId) return acc;
            
            if (!acc[productId]) {
              acc[productId] = [];
            }
            acc[productId].push(item);
            return acc;
          }, {} as Record<string, typeof order.items>);

          // Process each product group
          for (const [productId, items] of Object.entries(itemsByProduct)) {
            const productSnapshot = items[0]?.productSnapshot;
            if (!productSnapshot) {
              this.logger.warn('No product snapshot found for item', { orderId, productId });
              continue;
            }

            // Get product translations from snapshot
            const productTranslation = productSnapshot.translations?.[0];
            if (!productTranslation) {
              this.logger.warn('No translations found in product snapshot', { 
                orderId, 
                productId,
                productSnapshot: JSON.stringify(productSnapshot)
              });
              continue;
            }
            
            // Format event date
            const eventDateTime = items[0].createdAt || new Date();
            const eventDate = format(eventDateTime, 'dd/MM/yyyy', { locale: vi });

            // Generate QR codes and prepare ticket info for each item
            const tickets = await Promise.all(items.map(async (item) => {
              const qrCodeData = `${item.qrCode}`;
              const qrCodeUrl = await this.generateAndUploadQRCode(qrCodeData, orderId);

              // Get variant name from snapshot
              let variantName = 'Vé Thường';
              if (item.productSnapshot?.variant?.name) {
                variantName = item.productSnapshot.variant.name;
              } else if (item.productSnapshot?.translations?.[0]?.title) {
                variantName = item.productSnapshot.translations[0].title;
              }

              return {
                ticketNumber: variantName,
                ticketPrice: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPrice),
                qrCodeUrl: qrCodeUrl
              };
            }));

            // Prepare email data
            const emailData = {
              customerName: order.customerName || 'Quý khách',
              eventName: productTranslation.title || 'Vé tham quan',
              eventDate: eventDate,
              tickets
            };

            console.log('emailData', emailData);

            try {
              // Send email
              await this.mailService.sendMail({
                to: order.email,
                subject: `Vé điện tử cho ${emailData.eventName}`,
                template: {
                  id: 'TICKET_QR_CODE_VI',
                  data: emailData
                }
              });

              this.logger.log('Successfully sent ticket confirmation email', {
                orderId,
                customerEmail: order.email,
                productId,
                ticketCount: tickets.length
              });
            } catch (error) {
              this.logger.error('Error sending ticket confirmation email:', error);
              // Log more details about the error
              this.logger.error('Email data that failed:', {
                orderId,
                productId,
                emailData: JSON.stringify(emailData)
              });
            }
          }
        } catch (error) {
          this.logger.error('Error sending ticket confirmation email:', error);
          // Don't throw the error to prevent webhook processing failure
        }
      }

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