import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { OrderItem, ProductType } from '../../entities/order-item.entity';
import { PaymentGatewayInterface, CreatePaymentRequest, PaymentItem } from '../../../payment-gateway/interfaces/payment-gateway.interface';
import { PAYMENT_GATEWAY_TOKEN } from '../../../payment-gateway/payment-gateway.module';
import { Address } from '../../entities/order.entity';
import { PaymentFrontendService } from '../../../payment/frontend/services/payment-frontend.service';
import { MailService } from '../../../mail/services/mail.service';
import { UploadFrontendService } from '../../../upload/frontend/services/upload-frontend.service';
import * as QRCode from 'qrcode';
import { Readable } from 'stream';
import fetch from 'node-fetch';

export interface CreateOrderDto {
  orderCode: string;
  userId?: string;
  phoneCode: string;
  phoneNumber: string;
  email?: string;
  shippingAddress?: Partial<Address>;
  billingAddress?: Partial<Address>;
  paymentMethod: string;
  payment_method_id: number;
  notes?: string;
  totalAmount: number;
  return_url: string;
  cancel_url: string;
  payment_description: string;
}

@Injectable()
export class OrderFrontendService {
  private readonly logger = new Logger(OrderFrontendService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @Inject(PAYMENT_GATEWAY_TOKEN)
    private readonly paymentGateway: PaymentGatewayInterface,
    @Inject(forwardRef(() => PaymentFrontendService))
    private readonly paymentFrontendService: PaymentFrontendService,
    private readonly mailService: MailService,
    private readonly uploadFrontendService: UploadFrontendService,
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
        folder: 'qr-codes'
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
      throw error;
    }
  }

  async findOrderById(id: number): Promise<Order> {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'items.product.translations']
    });
  }

  async findOrderByCode(orderCode: string): Promise<Order> {
    return this.orderRepository.findOne({
      where: { orderCode },
      relations: ['items', 'items.product', 'items.product.translations']
    });
  }

  async findOrdersByUserId(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: ['items', 'items.product', 'items.product.translations'],
      order: { createdAt: 'DESC' }
    });
  }

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const order = this.orderRepository.create(orderData);
    return this.orderRepository.save(order);
  }

  async createOrderItems(items: Partial<OrderItem>[], orderId: number): Promise<OrderItem[]> {
    const orderItems = await Promise.all(items.map(async (item) => {
      const orderItem = this.orderItemRepository.create({
        ...item,
        orderId
      });

      // Generate QR code for ticket items
      if (item.productType === ProductType.TICKET) {
        try {
          // Generate unique QR code text
          const qrText = `TICKET-${orderId}-${item.productId}-${Date.now()}`;
          orderItem.qrCode = qrText;

          // Generate and upload QR code image
          const qrImageUrl = await this.generateAndUploadQRCode(qrText, orderId);
          orderItem.imageQrCode = qrImageUrl;
        } catch (error) {
          this.logger.error('Failed to generate QR code for ticket', {
            orderId,
            productId: item.productId,
            error: error.message
          });
        }
      }

      return orderItem;
    }));

    await this.orderItemRepository.save(orderItems);
    
    // Reload items with product translations
    return this.orderItemRepository.find({
      where: { id: In(orderItems.map(item => item.id)) },
      relations: ['product', 'product.translations']
    });
  }

  private getProductName(product: any, locale: string = 'en'): string {
    if (!product?.translations?.length) {
      return `Product #${product?.id || 'Unknown'}`;
    }
    const translation = product.translations.find((t: any) => t.locale === locale) || product.translations[0];
    return translation?.title || `Product #${product?.id || 'Unknown'}`;
  }

  async createOrderWithPayment(
    orderInput: {
      orderCode: string;
      userId?: string;
      phoneCode: string;
      phoneNumber: string;
      email?: string;
      shippingAddress?: Partial<Address>;
      billingAddress?: Partial<Address>;
      paymentMethod: string;
      notes?: string;
      totalAmount: number;
      payment_method_id: number;
      return_url: string;
      cancel_url: string;
      payment_description: string;
    },
    items: Partial<OrderItem>[],
    paymentRequest: Omit<CreatePaymentRequest, 'order_id' | 'amount'>
  ) {
    // Convert input to Order type
    const orderData: Partial<Order> = {
      ...orderInput,
      shippingAddress: orderInput.shippingAddress as Address,
      billingAddress: orderInput.billingAddress as Address,
    };

    // Create order and items in a transaction
    const order = await this.createOrder(orderData);
    const orderItems = await this.createOrderItems(items, order.id);

    // Create payment transaction
    const paymentTransaction = await this.paymentFrontendService.createPayment({
      payment_method_id: orderInput.payment_method_id,
      order_id: order.id,
      amount: Math.round(Number(orderData.totalAmount)),
      description: orderInput.payment_description,
      return_url: orderInput.return_url,
      cancel_url: orderInput.cancel_url
    });

    return {
      order: {
        ...order,
        items: orderItems
      },
      payment: paymentTransaction
    };
  }

  async getLatestOrder(): Promise<Order | null> {
    return this.orderRepository.findOne({
      order: { id: 'DESC' }
    });
  }
} 