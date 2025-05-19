import { BadRequestException, HttpException, HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../../../backend/src/modules/order/entities/order.entity';
import { OrderAdminService } from '../../../../backend/src/modules/order/admin/services/order-admin.service';
import { PaymentFrontendService } from '../../../../backend/src/modules/payment/frontend/services/payment-frontend.service';
import { MailService } from '../../../../backend/src/modules/mail/services/mail.service';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { OrderCancelDto, OrderConfirmDto } from '../dtos/order-action.dto';
import { OrderItemResponseDto, OrderResponseDto } from '../dtos/order-response.dto';
import { TicketService } from '../../ticket/services/ticket.service';
import { ProductType } from '../../../../backend/src/modules/product/entities/product.entity';
import { OrderItem, ProductSnapshot } from '../../../../backend/src/modules/order/entities/order-item.entity';
import * as crypto from 'crypto';

// Mở rộng type Order để thêm các property metadata
type ExtendedOrder = Order & {
  metadata?: Record<string, any>;
};

// Mở rộng type OrderItem để thêm các property metadata
type ExtendedOrderItem = OrderItem & {
  metadata?: Record<string, any>;
};

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly orderAdminService: OrderAdminService,
    private readonly paymentService: PaymentFrontendService,
    private readonly mailService: MailService,
    private readonly ticketService: TicketService,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    try {
      this.logger.log('Creating new order', { email: createOrderDto.email });

      // Tính tổng tiền đơn hàng
      const totalAmount = createOrderDto.items.reduce(
        (sum, item) => sum + (item.quantity * item.unitPrice), 
        0
      );

      // Chuẩn bị dữ liệu cho order
      const orderCode = this.generateOrderCode();
      const orderData: Partial<Order> = {
        orderCode,
        customerName: createOrderDto.customerName,
        email: createOrderDto.email,
        phoneCode: '+84', // Mặc định là Việt Nam
        phoneNumber: createOrderDto.phone,
        paymentMethod: createOrderDto.paymentMethod,
        status: 'pending' as any,
        paymentStatus: 'pending' as any,
        orderType: 'standard' as any,
        totalAmount,
        notes: JSON.stringify({
          returnUrl: createOrderDto.returnUrl,
          ...createOrderDto.metadata
        })
      };

      // Tạo đơn hàng mới
      const newOrder = await this.orderRepository.save(orderData);

      // Tạo các items cho đơn hàng
      const orderItems = createOrderDto.items.map(item => {
        const orderItem = new OrderItem();
        orderItem.order = newOrder;
        orderItem.productId = item.ticketId;
        orderItem.quantity = item.quantity;
        orderItem.unitPrice = item.unitPrice;
        orderItem.totalPrice = item.quantity * item.unitPrice;
        orderItem.productType = 'TICKET' as any;
        orderItem.productSnapshot = {
          id: item.ticketId,
          title: `Ticket #${item.ticketId}`,
          translations: [{ locale: 'vi', title: `Ticket #${item.ticketId}` }]
        };
        orderItem.travelDate = item.selectedDate ? new Date(item.selectedDate) : null;
        return orderItem;
      });

      await this.orderItemRepository.save(orderItems);

      // Khởi tạo thanh toán qua PaymentService
      const paymentResult = await this.paymentService.createPayment({
        order_id: newOrder.id,
        amount: newOrder.totalAmount,
        payment_method_id: parseInt(createOrderDto.paymentMethod) || 1,
        return_url: createOrderDto.returnUrl || this.configService.get('DEFAULT_RETURN_URL'),
        cancel_url: createOrderDto.returnUrl || this.configService.get('DEFAULT_RETURN_URL'),
        description: `Payment for order ${orderCode}`
      });

      // Cập nhật payment URL vào đơn hàng
      if (paymentResult && paymentResult.payment_url) {
        const notesData = newOrder.notes ? JSON.parse(newOrder.notes) : {};
        await this.orderRepository.update(newOrder.id, {
          notes: JSON.stringify({
            ...notesData,
            payment_url: paymentResult.payment_url
          })
        });
      }

      // Lấy thông tin đơn hàng đầy đủ và trả về
      return this.getOrderById(newOrder.id);
    } catch (error) {
      this.logger.error('Error creating order:', error);
      throw error;
    }
  }

  private generateOrderCode(): string {
    const prefix = 'ORD';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  async getOrderById(id: number): Promise<OrderResponseDto> {
    try {
      // Lấy thông tin đơn hàng với quan hệ
      const order = await this.orderRepository.findOne({
        where: { id },
        relations: ['items', 'items.product', 'items.product.translations']
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      // Chuyển đổi dữ liệu sang format response
      return this.mapToResponseDto(order);
    } catch (error) {
      this.logger.error(`Error fetching order with ID ${id}:`, error);
      throw error;
    }
  }

  async confirmOrder(confirmDto: OrderConfirmDto): Promise<OrderResponseDto> {
    try {
      const { orderId, transactionId, paymentReference, metadata } = confirmDto;
      
      // Kiểm tra trạng thái đơn hàng hiện tại
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
        relations: ['items']
      });
      
      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }
      
      if (order.paymentStatus === 'paid') {
        this.logger.log(`Order ${orderId} is already paid`);
        return this.getOrderById(orderId);
      }

      // Cập nhật trạng thái đơn hàng
      order.paymentStatus = 'paid' as any;
      order.status = 'confirmed' as any;
      
      // Cập nhật thông tin giao dịch vào notes
      const notesData = order.notes ? JSON.parse(order.notes) : {};
      order.notes = JSON.stringify({
        ...notesData,
        transactionId,
        paymentReference,
        confirmedAt: new Date().toISOString(),
        ...metadata
      });
      
      await this.orderRepository.save(order);
      
      // Tạo QR code cho các item trong đơn hàng
      for (const item of order.items) {
        try {
          // Tạo mã QR
          const ticketToken = this.generateTicketToken(order.id, item.id);
          const qrCodeUrl = await this.generateQrCodeUrl(ticketToken);
          
          // Cập nhật item
          item.qrCode = ticketToken;
          item.imageQrCode = qrCodeUrl;
          await this.orderItemRepository.save(item);
        } catch (error) {
          this.logger.error(`Failed to generate QR code for order item ${item.id}:`, error);
        }
      }
      
      // Gửi email xác nhận với vé điện tử
      const updatedOrder = await this.getOrderById(orderId);
      await this.sendTicketConfirmationEmail(updatedOrder);
      
      return updatedOrder;
    } catch (error) {
      this.logger.error('Error confirming order:', error);
      throw error;
    }
  }

  private generateTicketToken(orderId: number, itemId: number): string {
    const timestamp = Date.now();
    const randomPart = crypto.randomBytes(6).toString('hex');
    return `TKT-${orderId}-${itemId}-${timestamp}-${randomPart}`;
  }

  private async generateQrCodeUrl(ticketToken: string): Promise<string> {
    // Tạo một URL giả cho QR code - trong thực tế cần triển khai tạo QR code thực
    const baseUrl = this.configService.get('TICKET_VERIFICATION_URL', 'https://verify.example.com');
    return `${baseUrl}/${ticketToken}`;
  }

  async cancelOrder(cancelDto: OrderCancelDto): Promise<OrderResponseDto> {
    try {
      const { orderId, reason, metadata } = cancelDto;
      
      // Kiểm tra trạng thái đơn hàng hiện tại
      const order = await this.orderRepository.findOne({
        where: { id: orderId }
      });
      
      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }
      
      // Chỉ có thể hủy đơn hàng trong trạng thái pending
      if (order.status !== 'pending') {
        throw new BadRequestException(`Cannot cancel order with status ${order.status}`);
      }
      
      // Cập nhật trạng thái và thông tin hủy
      order.status = 'cancelled' as any;
      
      // Cập nhật lý do hủy vào notes
      const notesData = order.notes ? JSON.parse(order.notes) : {};
      order.notes = JSON.stringify({
        ...notesData,
        cancellationReason: reason,
        cancelledAt: new Date().toISOString(),
        ...metadata
      });
      
      await this.orderRepository.save(order);
      
      return this.getOrderById(orderId);
    } catch (error) {
      this.logger.error('Error cancelling order:', error);
      throw error;
    }
  }

  // Helper methods cho việc chuyển đổi dữ liệu
  private mapToResponseDto(order: Order): OrderResponseDto {
    const returnUrl = order.notes ? 
      JSON.parse(order.notes)?.returnUrl || null : null;
    
    const paymentUrl = order.notes ? 
      JSON.parse(order.notes)?.payment_url || null : null;

    return {
      id: order.id,
      orderCode: order.orderCode,
      customerName: order.customerName || '',
      email: order.email || '',
      phone: order.phoneNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt.toISOString(),
      items: order.items ? order.items.map(item => this.mapToItemResponseDto(item)) : [],
      returnUrl,
      paymentUrl,
    };
  }

  private mapToItemResponseDto(item: OrderItem): OrderItemResponseDto {
    const title = item.product?.translations?.[0]?.title || 
      item.productSnapshot?.translations?.[0]?.title || 
      `Product #${item.productId}`;

    return {
      id: item.id,
      productId: item.productId,
      title,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      isUsed: item.isUsed,
      qrCode: item.qrCode,
      qrCodeImageUrl: item.imageQrCode,
      travelDate: item.travelDate ? item.travelDate.toISOString().split('T')[0] : null,
    };
  }

  private async sendTicketConfirmationEmail(order: OrderResponseDto): Promise<void> {
    try {
      if (!order.email) {
        this.logger.warn(`No email address for order ${order.id}, skipping ticket confirmation email`);
        return;
      }

      // Prepare email data
      const emailData = {
        customerName: order.customerName,
        orderCode: order.orderCode,
        orderDate: new Date().toLocaleDateString('vi-VN'),
        totalAmount: order.totalAmount.toLocaleString('vi-VN', { 
          style: 'currency', 
          currency: 'VND' 
        }),
        tickets: order.items.map(item => ({
          ticketName: item.title,
          ticketPrice: item.unitPrice.toLocaleString('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
          }),
          selectedDate: item.travelDate 
            ? new Date(item.travelDate).toLocaleDateString('vi-VN') 
            : '',
          qrCodeUrl: item.qrCodeImageUrl || '',
        })),
      };

      // Send email using the mail service
      await this.mailService.sendMail({
        to: order.email,
        subject: `Vé điện tử - Mã đơn hàng #${order.orderCode}`,
        template: {
          id: 'TICKET_CONFIRMATION',
          data: emailData
        }
      });

      this.logger.log(`Ticket confirmation email sent to ${order.email} for order ${order.id}`);
    } catch (error) {
      this.logger.error(`Failed to send ticket confirmation email for order ${order.id}:`, error);
      // Không throw lỗi vì đây là một quy trình phụ và không nên ảnh hưởng đến luồng chính
    }
  }
} 