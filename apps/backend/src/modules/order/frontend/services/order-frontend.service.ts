import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { OrderItem, ProductType } from '../../entities/order-item.entity';
import { OrderRefund, RefundStatus, RefundType, RefundReason } from '../../entities/order-refund.entity';
import { OrderRefundItem } from '../../entities/order-refund-item.entity';
import { PaymentGatewayInterface, CreatePaymentRequest, PaymentItem } from '../../../payment-gateway/interfaces/payment-gateway.interface';
import { PAYMENT_GATEWAY_TOKEN } from '../../../payment-gateway/payment-gateway.module';
import { Address } from '../../entities/order.entity';
import { PaymentFrontendService } from '../../../payment/frontend/services/payment-frontend.service';
import { MailService } from '../../../mail/services/mail.service';
import { UploadFrontendService } from '../../../upload/frontend/services/upload-frontend.service';
import { generateRefundCode } from '../../utils/refund-code.util';
import * as QRCode from 'qrcode';
import { Readable } from 'stream';
import fetch from 'node-fetch';
import { DashboardStatsService } from '../../../dashboard/services/dashboard-stats.service';

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

export interface CreateRefundDto {
  orderCode: string;
  requesterPhone: string;
  requesterPhoneCode: string;
  requesterName: string;
  requesterEmail?: string;
  refundReason: RefundReason;
  refundType: RefundType;
  details?: string;
  items: {
    orderItemId: number;
    quantity: number;
    reason?: string;
    newDate?: string;
  }[];
}

@Injectable()
export class OrderFrontendService {
  private readonly logger = new Logger(OrderFrontendService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderRefund)
    private readonly orderRefundRepository: Repository<OrderRefund>,
    @InjectRepository(OrderRefundItem)
    private readonly orderRefundItemRepository: Repository<OrderRefundItem>,
    @Inject(PAYMENT_GATEWAY_TOKEN)
    private readonly paymentGateway: PaymentGatewayInterface,
    @Inject(forwardRef(() => PaymentFrontendService))
    private readonly paymentFrontendService: PaymentFrontendService,
    private readonly mailService: MailService,
    private readonly uploadFrontendService: UploadFrontendService,
    private readonly dashboardStatsService: DashboardStatsService,
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

    // Update dashboard stats
    try {
      await this.dashboardStatsService.calculateAndUpdateStats();
    } catch (error) {
      this.logger.error('Failed to update dashboard stats after order creation:', error);
    }

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

  /**
   * Tìm kiếm đơn hàng theo orderCode và số điện thoại
   */
  async findOrderByCodeAndPhone(orderCode: string, phoneNumber: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { orderCode, phoneNumber },
      relations: ['items', 'items.product', 'items.product.translations']
    });
  }

  /**
   * Tìm yêu cầu hoàn trả theo refundCode
   */
  async findRefundByCode(refundCode: string): Promise<OrderRefund | null> {
    return this.orderRefundRepository.findOne({
      where: { refundCode },
      relations: ['items', 'items.orderItem', 'items.orderItem.product', 'items.orderItem.product.translations', 'order']
    });
  }

  /**
   * Tìm các yêu cầu hoàn trả theo orderCode
   */
  async findRefundsByOrderCode(orderCode: string): Promise<OrderRefund[]> {
    const order = await this.orderRepository.findOne({ where: { orderCode } });
    if (!order) return [];
    
    return this.orderRefundRepository.find({
      where: { orderId: order.id },
      relations: ['items', 'items.orderItem', 'order'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Tạo yêu cầu hoàn trả
   */
  async createRefundRequest(refundData: CreateRefundDto): Promise<OrderRefund> {
    // Tìm đơn hàng
    const order = await this.orderRepository.findOne({
      where: { orderCode: refundData.orderCode },
      relations: ['items']
    });
    
    if (!order) {
      throw new Error(`Không tìm thấy đơn hàng với mã ${refundData.orderCode}`);
    }

    // Kiểm tra các orderItem có tồn tại không
    const orderItems = await this.orderItemRepository.findBy({
      id: In(refundData.items.map(item => item.orderItemId))
    });

    if (orderItems.length !== refundData.items.length) {
      throw new Error('Một hoặc nhiều sản phẩm không thuộc đơn hàng này');
    }

    // Tính tổng tiền hoàn trả (nếu là hoàn tiền)
    let totalRefundAmount = 0;
    if (refundData.refundType === RefundType.MONEY_REFUND) {
      for (const item of refundData.items) {
        const orderItem = orderItems.find(oi => oi.id === item.orderItemId);
        if (orderItem) {
          const itemRefundAmount = Number(orderItem.unitPrice) * item.quantity;
          totalRefundAmount += itemRefundAmount;
        }
      }
    }

    // Tạo mã hoàn trả
    const refundCode = generateRefundCode();

    // Tạo bản ghi hoàn trả
    const refund = this.orderRefundRepository.create({
      orderId: order.id,
      refundCode: refundCode,
      requesterName: refundData.requesterName,
      requesterPhone: refundData.requesterPhone,
      requesterPhoneCode: refundData.requesterPhoneCode,
      requesterEmail: refundData.requesterEmail,
      refundReason: refundData.refundReason,
      refundType: refundData.refundType,
      refundAmount: totalRefundAmount > 0 ? totalRefundAmount : null,
      status: RefundStatus.PENDING,
      details: refundData.details
    });

    // Lưu bản ghi và tạo các item hoàn trả
    const savedRefund = await this.orderRefundRepository.save(refund);

    // Tạo các item hoàn trả
    const refundItems: OrderRefundItem[] = [];
    for (const item of refundData.items) {
      const orderItem = order.items.find(oi => oi.id === item.orderItemId);
      
      const refundItem = this.orderRefundItemRepository.create({
        refundId: savedRefund.id,
        orderItemId: item.orderItemId,
        quantity: item.quantity,
        refundAmount: orderItem ? Number(orderItem.unitPrice) * item.quantity : null,
        reason: item.reason,
        newDate: item.newDate
      });
      
      refundItems.push(refundItem);
    }

    await this.orderRefundItemRepository.save(refundItems);

    // Gửi email thông báo
    try {
      await this.mailService.sendRefundRequestNotification({
        to: refundData.requesterEmail || order.email,
        orderCode: order.orderCode,
        refundCode: refundCode,
        customerName: refundData.requesterName,
        refundType: refundData.refundType,
        refundAmount: totalRefundAmount
      });
    } catch (error) {
      this.logger.error(`Failed to send refund notification email: ${error.message}`);
    }

    // Trả về kết quả đã bao gồm các item
    return this.findRefundByCode(refundCode);
  }

  /**
   * Kiểm tra trạng thái yêu cầu hoàn trả
   */
  async checkRefundStatus(refundCode: string): Promise<OrderRefund> {
    const refund = await this.findRefundByCode(refundCode);
    
    if (!refund) {
      throw new Error(`Không tìm thấy yêu cầu hoàn trả với mã ${refundCode}`);
    }
    
    return refund;
  }
} 