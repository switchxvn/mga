import { Injectable, NotFoundException, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, Between, IsNull, ILike, FindOptionsWhere, In, Not, Raw, MoreThanOrEqual } from 'typeorm';
import { subDays } from 'date-fns';
import { Order } from '../../entities/order.entity';
import { OrderItem, ProductType } from '../../entities/order-item.entity';
import { OrderRefund, RefundStatus, RefundType } from '../../entities/order-refund.entity';
import { OrderRefundItem } from '../../entities/order-refund-item.entity';
import { OrderTicketScanHistory } from '../../entities/order-ticket-scan-history.entity';
import { Product } from '../../../product/entities/product.entity';
import { OrderStatus, PaymentStatus, OrderType } from '@ew/shared';
import { MailService } from '../../../mail/services/mail.service';
import { UploadFrontendService } from '../../../upload/frontend/services/upload-frontend.service';
import * as QRCode from 'qrcode';
// Using native fetch - Node.js 18+ support

// Interface cho thông tin quét vé
export interface ScanTicketResult {
  success: boolean;
  message: string;
  orderItem?: OrderItem;
  scanHistory?: OrderTicketScanHistory;
  isFirstScan?: boolean;
  scanCount?: number;
}

// Interface cho thông tin thiết bị quét
export interface DeviceInfo {
  name?: string;
  type?: string;
  os?: string;
  browser?: string;
  ip?: string;
  [key: string]: any;
}

// Interface cho lịch sử quét vé
export interface ScanHistoryResponse {
  items: (OrderTicketScanHistory & { scanCount?: number })[];
  total: number;
}

@Injectable()
export class OrderAdminService {
  private readonly logger = new Logger(OrderAdminService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderRefund)
    private readonly orderRefundRepository: Repository<OrderRefund>,
    @InjectRepository(OrderRefundItem)
    private readonly orderRefundItemRepository: Repository<OrderRefundItem>,
    @InjectRepository(OrderTicketScanHistory)
    private readonly scanHistoryRepository: Repository<OrderTicketScanHistory>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly mailService: MailService,
    private readonly uploadFrontendService: UploadFrontendService
  ) {}

  async findAllOrders(options: {
    page?: number;
    pageSize?: number;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    search?: string;
  }): Promise<{ items: Order[]; total: number }> {
    const { page = 1, pageSize = 10, status, paymentStatus, search } = options;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('order.countryPhoneCode', 'countryPhoneCode');

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (paymentStatus) {
      queryBuilder.andWhere('order.paymentStatus = :paymentStatus', { paymentStatus });
    }

    if (search) {
      queryBuilder.andWhere(
        '(CAST(order.id as TEXT) LIKE :search OR order.userId LIKE :search OR order.phoneNumber LIKE :search OR order.email LIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [items, total] = await queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items, total };
  }

  async findOrderById(id: number): Promise<Order> {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'countryPhoneCode']
    });
  }

  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
    await this.orderRepository.update(id, { status });
    return this.findOrderById(id);
  }

  async updateOrderDetails(id: number, data: {
    customerName?: string;
    email?: string;
    phoneCode?: string;
    phoneNumber?: string;
    notes?: string;
    shippingAddress?: any;
    billingAddress?: any;
    paymentMethod?: string;
  }): Promise<Order> {
    await this.orderRepository.update(id, data);
    return this.findOrderById(id);
  }

  async updatePaymentStatus(id: number, status: PaymentStatus): Promise<Order | null> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'items', 
        'items.product',
        'items.product.translations'
      ]
    });

    if (!order) {
      return null;
    }

    order.paymentStatus = status;
    return this.orderRepository.save(order);
  }

  async updateOrderItemUsageStatus(orderItemId: number, isUsed: boolean): Promise<OrderItem> {
    await this.orderItemRepository.update(orderItemId, { isUsed });
    return this.orderItemRepository.findOne({
      where: { id: orderItemId },
      relations: ['product']
    });
  }

  async deleteOrder(id: number): Promise<void> {
    await this.orderRepository.delete(id);
  }

  async getProductWithTranslations(productId: number) {
    return this.productRepository.findOne({
      where: { id: productId },
      relations: ['translations']
    });
  }

  async findAllRefunds(options: {
    page?: number;
    pageSize?: number;
    status?: RefundStatus;
    search?: string;
  }): Promise<{ items: OrderRefund[]; total: number }> {
    const { page = 1, pageSize = 10, status, search } = options;

    const queryBuilder = this.orderRefundRepository
      .createQueryBuilder('refund')
      .leftJoinAndSelect('refund.order', 'order')
      .leftJoinAndSelect('refund.items', 'items')
      .leftJoinAndSelect('items.orderItem', 'orderItem');

    if (status) {
      queryBuilder.andWhere('refund.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(refund.refundCode LIKE :search OR refund.requesterName LIKE :search OR refund.requesterPhone LIKE :search OR refund.requesterEmail LIKE :search OR order.orderCode LIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [items, total] = await queryBuilder
      .orderBy('refund.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items, total };
  }

  async findRefundById(id: number): Promise<OrderRefund> {
    return this.orderRefundRepository.findOne({
      where: { id },
      relations: [
        'order',
        'items',
        'items.orderItem',
        'items.orderItem.product',
        'items.orderItem.product.translations'
      ]
    });
  }

  async updateRefundStatus(id: number, status: RefundStatus, adminNotes?: string): Promise<OrderRefund> {
    const refund = await this.findRefundById(id);
    
    if (!refund) {
      throw new Error('Không tìm thấy yêu cầu hoàn trả');
    }

    refund.status = status;
    
    if (adminNotes) {
      refund.adminNotes = adminNotes;
    }

    if (status === RefundStatus.COMPLETED) {
      refund.completedAt = new Date();
    }

    // Nếu đồng ý đổi vé (approved hoặc completed) và là loại đổi ngày (RESCHEDULE)
    if ((status === RefundStatus.APPROVED || status === RefundStatus.COMPLETED) && 
        refund.refundType === RefundType.RESCHEDULE) {
      
      // Tạo đơn hàng mới dựa trên đơn hàng cũ
      await this.processTicketExchange(refund);
    }

    return this.orderRefundRepository.save(refund);
  }

  /**
   * Tạo và upload QR code cho vé
   */
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

      // Upload buffer directly via fetch
      const response = await fetch(result.presignedUrl, {
        method: 'PUT',
        body: qrBuffer,
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

  /**
   * Xử lý đổi vé khi admin đồng ý, tạo đơn hàng mới với ngày mới
   */
  private async processTicketExchange(refund: OrderRefund): Promise<void> {
    try {
      // Lấy chi tiết đơn hàng gốc kèm items
      const originalOrder = await this.orderRepository.findOne({
        where: { id: refund.orderId },
        relations: ['items', 'items.product', 'items.product.translations']
      });
      
      if (!originalOrder) {
        throw new Error(`Không tìm thấy đơn hàng gốc với ID: ${refund.orderId}`);
      }
      
      // Lấy thông tin về các ticket items cần đổi ngày
      const refundItems = await this.orderRefundItemRepository.find({
        where: { refundId: refund.id },
        relations: ['orderItem']
      });
      
      if (!refundItems.length) {
        throw new Error('Không tìm thấy thông tin vé cần đổi');
      }
      
      // Kiểm tra xem có tất cả các refund items đều có newDate không
      const missingNewDates = refundItems.some(item => !item.newDate);
      if (missingNewDates) {
        throw new Error('Một số vé chưa có ngày mới, không thể hoàn tất đổi vé');
      }
      
      // Tạo mã đơn hàng mới
      const newOrderCode = this.generateExchangeOrderCode(originalOrder.orderCode);
      
      // Tạo đơn hàng mới (clone từ đơn hàng cũ)
      const newOrder = this.orderRepository.create({
        orderCode: newOrderCode,
        orderType: OrderType.TICKET,
        customerName: originalOrder.customerName,
        phoneCode: originalOrder.phoneCode,
        phoneNumber: originalOrder.phoneNumber,
        email: originalOrder.email,
        paymentMethod: originalOrder.paymentMethod,
        paymentStatus: PaymentStatus.PAID, // Đơn đổi vé đã được thanh toán
        status: OrderStatus.CONFIRMED, // Đơn đổi vé đã hoàn tất
        totalAmount: 0, // Sẽ được tính lại dựa trên các items
        userId: originalOrder.userId,
        notes: `Đơn hàng đổi vé từ đơn ${originalOrder.orderCode}, mã yêu cầu đổi: ${refund.refundCode}`,
        shippingAddress: originalOrder.shippingAddress,
        billingAddress: originalOrder.billingAddress,
        exchangeForOrderId: originalOrder.id // Lưu ID đơn hàng gốc
      });
      
      // Lưu đơn hàng mới
      const savedNewOrder = await this.orderRepository.save(newOrder);
      
      // Tạo OrderItem mới cho đơn mới, chỉ tạo các item có trong refundItems và cập nhật ngày đi
      const orderItemsToCreate = [];
      
      for (const refundItem of refundItems) {
        // Tìm thông tin item gốc
        const originalItem = originalOrder.items.find(item => item.id === refundItem.orderItemId);
        
        if (originalItem) {
          // Tạo item mới với thông tin từ item gốc nhưng với ngày mới
          const newOrderItem = this.orderItemRepository.create({
            orderId: savedNewOrder.id,
            productId: originalItem.productId,
            productType: originalItem.productType,
            productSnapshot: originalItem.productSnapshot,
            quantity: refundItem.quantity,
            unitPrice: originalItem.unitPrice,
            totalPrice: Number(originalItem.unitPrice) * refundItem.quantity,
            travelDate: new Date(refundItem.newDate) // Ngày mới từ refundItem
          });
          
          // Tạo QR code cho vé mới
          if (newOrderItem.productType === ProductType.TICKET) {
            try {
              // Tạo mã QR code mới
              const qrText = `TICKET-${savedNewOrder.id}-${newOrderItem.productId}-${Date.now()}`;
              newOrderItem.qrCode = qrText;
              
              // Tạo và upload QR code image
              const qrImageUrl = await this.generateAndUploadQRCode(qrText, savedNewOrder.id);
              newOrderItem.imageQrCode = qrImageUrl;
            } catch (error) {
              this.logger.error('Failed to generate QR code for exchanged ticket', {
                orderId: savedNewOrder.id,
                productId: newOrderItem.productId,
                error: error.message
              });
            }
          }
          
          // Cập nhật tổng tiền cho đơn hàng mới
          savedNewOrder.totalAmount += Number(newOrderItem.totalPrice);
          
          orderItemsToCreate.push(newOrderItem);
        }
      }
      
      // Lưu các items mới
      if (orderItemsToCreate.length > 0) {
        await this.orderItemRepository.save(orderItemsToCreate);
      }
      
      // Cập nhật lại tổng tiền cho đơn mới
      await this.orderRepository.update(savedNewOrder.id, { 
        totalAmount: savedNewOrder.totalAmount 
      });
      
      // Cập nhật thông tin refund để lưu đơn hàng mới đã tạo
      refund.newOrderId = savedNewOrder.id;
      
      // Lưu lại thông tin refund đã cập nhật
      await this.orderRefundRepository.save(refund);
      
      // Gửi email thông báo đổi vé thành công
      await this.sendTicketExchangeEmail(refund, originalOrder, savedNewOrder, refundItems);
      
    } catch (error) {
      this.logger.error('Failed to process ticket exchange', {
        refundId: refund.id,
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Lỗi khi xử lý đổi vé: ${error.message}`);
    }
  }

  /**
   * Tạo mã đơn hàng mới cho đơn đổi vé
   */
  private generateExchangeOrderCode(originalOrderCode: string): string {
    // Tạo mã mới với tiền tố EX (Exchange) + mã đơn gốc
    return `EX-${originalOrderCode}`;
  }

  /**
   * Gửi email thông báo đổi vé thành công
   */
  private async sendTicketExchangeEmail(
    refund: OrderRefund, 
    originalOrder: Order, 
    newOrder: Order,
    refundItems: OrderRefundItem[]
  ): Promise<void> {
    try {
      // Lấy tất cả order items mới từ đơn hàng mới
      const newOrderItems = await this.orderItemRepository.find({
        where: { orderId: newOrder.id },
        relations: ['product', 'product.translations']
      });

      // Lấy thông tin chi tiết về các vé đã đổi
      const ticketDetails = await Promise.all(refundItems.map(async (item) => {
        // Lấy thông tin sản phẩm cũ
        const oldOrderItem = await this.orderItemRepository.findOne({
          where: { id: item.orderItemId },
          relations: ['product', 'product.translations']
        });
        
        if (!oldOrderItem) return null;
        
        // Tìm order item mới tương ứng
        const newOrderItem = newOrderItems.find(ni => 
          ni.productId === oldOrderItem.productId && 
          new Date(ni.travelDate).toISOString().split('T')[0] === new Date(item.newDate).toISOString().split('T')[0]
        );
        
        // Lấy tên sản phẩm từ translation
        const viTranslation = oldOrderItem?.product?.translations?.find(t => t.locale === 'vi');
        const productName = viTranslation?.title || 
                           oldOrderItem?.productSnapshot?.title || 
                           'Vé không xác định';
        // Lấy tên biến thể từ productSnapshot
        const variantName = oldOrderItem?.productSnapshot?.variant?.name || '';
        
        // Format dates
        const oldDateStr = oldOrderItem.travelDate ? 
          new Date(oldOrderItem.travelDate).toLocaleDateString('vi-VN') : 'Không có ngày';
        const newDateStr = item.newDate ? 
          new Date(item.newDate).toLocaleDateString('vi-VN') : 'Không có ngày';
        
        return {
          productName,
          variantName,
          quantity: item.quantity,
          oldDate: oldDateStr,
          newDate: newDateStr,
          qrImageUrl: newOrderItem?.imageQrCode || null
        };
      }));
      
      // Loại bỏ các item null
      const validTicketDetails = ticketDetails.filter(ticket => ticket !== null);
      
      // Gửi email với thông tin chi tiết
      await this.mailService.sendTicketExchangeConfirmation({
        to: refund.requesterEmail || originalOrder.email,
        customerName: refund.requesterName || originalOrder.customerName,
        originalOrderCode: originalOrder.orderCode,
        newOrderCode: newOrder.orderCode,
        refundCode: refund.refundCode,
        tickets: validTicketDetails
      });
    } catch (error) {
      this.logger.error('Error sending ticket exchange email:', {
        error: error.message,
        refundId: refund.id,
        originalOrderId: originalOrder.id,
        newOrderId: newOrder.id
      });
      // Không throw lỗi tại đây để không ảnh hưởng đến quá trình xử lý đổi vé
    }
  }

  /**
   * Đếm số lượt quét/sử dụng vé
   */
  async getTicketScanCount(orderItemId: number): Promise<number> {
    try {
      const count = await this.scanHistoryRepository.count({
        where: { orderItemId }
      });
      
      return count;
    } catch (error) {
      console.error('Error in getTicketScanCount:', error);
      return 0;
    }
  }

  /**
   * Quét mã QR vé và cập nhật trạng thái sử dụng
   */
  async scanTicket(
    qrCode: string,
    userId: string,
    location?: string,
    deviceInfo?: DeviceInfo
  ): Promise<ScanTicketResult> {
    console.log('OrderAdminService.scanTicket called with:', { qrCode, userId, location });
    
    try {
      // Tìm OrderItem dựa trên mã QR
      const orderItem = await this.orderItemRepository.findOne({
        where: { qrCode },
        relations: ['order', 'product', 'product.translations']
      });

      console.log('OrderItem found:', orderItem ? 'yes' : 'no');

      if (!orderItem) {
        return {
          success: false,
          message: 'Không tìm thấy vé với mã QR này. Vui lòng kiểm tra lại mã QR.'
        };
      }

      // Kiểm tra xem có phải vé không
      if (orderItem.productType !== ProductType.TICKET) {
        console.log('Product type is not TICKET:', orderItem.productType);
        return {
          success: false,
          message: 'Mã QR này không phải là vé.'
        };
      }

      // Kiểm tra trạng thái đơn hàng
      console.log('Order status:', orderItem.order?.status, 'Payment status:', orderItem.order?.paymentStatus);
      if (orderItem.order?.paymentStatus !== PaymentStatus.PAID) {
        return {
          success: false,
          message: 'Vé này chưa được thanh toán. Vui lòng yêu cầu khách hàng thanh toán đơn hàng trước khi sử dụng vé.'
        };
      }
      
      if (orderItem.order?.status !== OrderStatus.CONFIRMED) {
        return {
          success: false,
          message: 'Đơn hàng chưa được xác nhận.'
        };
      }

      // Kiểm tra lịch sử quét vé 
      const scanHistories = await this.scanHistoryRepository.find({
        where: { orderItemId: orderItem.id }
      });

      const isFirstScan = scanHistories.length === 0;
      console.log('Is first scan:', isFirstScan, 'Scan history count:', scanHistories.length);

      try {
        // Lưu lịch sử quét vé
        console.log('Creating scan history with:', { orderItemId: orderItem.id, userId, isFirstScan });
        const scanHistory = this.scanHistoryRepository.create({
          orderItemId: orderItem.id,
          scannedBy: userId,
          scannedAt: new Date(),
          location,
          deviceInfo,
          isFirstScan
        });

        await this.scanHistoryRepository.save(scanHistory);
        console.log('Scan history saved successfully');

        // Cập nhật trạng thái sử dụng vé nếu chưa sử dụng
        if (!orderItem.isUsed) {
          console.log('Updating orderItem isUsed to true');
          orderItem.isUsed = true;
          await this.orderItemRepository.save(orderItem);
        }

        // Đếm số lượt quét vé (bao gồm cả lượt mới thêm)
        const scanCount = scanHistories.length + 1;

        return {
          success: true,
          message: isFirstScan 
            ? 'Vé hợp lệ và đây là lần đầu tiên sử dụng.' 
            : 'Vé hợp lệ nhưng đã được quét trước đó.',
          orderItem,
          scanHistory,
          isFirstScan,
          scanCount
        };
      } catch (error) {
        console.error('Error in scanTicket while saving data:', error);
        throw error;
      }
    } catch (error) {
      console.error('Exception in scanTicket method:', error);
      throw error;
    }
  }

  /**
   * Tìm vé theo mã QR
   */
  async findTicketByQrCode(qrCode: string): Promise<OrderItem> {
    const orderItem = await this.orderItemRepository.findOne({
      where: { qrCode },
      relations: ['order', 'product', 'product.translations']
    });

    if (!orderItem) {
      throw new NotFoundException('Không tìm thấy vé với mã QR này');
    }

    // Kiểm tra trạng thái thanh toán
    if (orderItem.order?.paymentStatus !== PaymentStatus.PAID) {
      throw new Error('Vé này chưa được thanh toán. Vui lòng yêu cầu khách hàng thanh toán đơn hàng trước khi sử dụng vé.');
    }

    return orderItem;
  }

  /**
   * Lấy lịch sử quét vé
   */
  async getTicketScanHistory(orderItemId: number): Promise<OrderTicketScanHistory[]> {
    return this.scanHistoryRepository.find({
      where: { orderItemId },
      relations: ['scanner', 'scanner.profile'],
      order: { scannedAt: 'DESC' }
    });
  }

  /**
   * Tìm tất cả lịch sử quét vé với phân trang
   */
  async findAllTicketScans(options: {
    page?: number;
    pageSize?: number;
    search?: string;
    scannerSearch?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{ items: OrderTicketScanHistory[]; total: number }> {
    const { page = 1, pageSize = 10, search, scannerSearch, status, startDate, endDate } = options;

    const queryBuilder = this.scanHistoryRepository
      .createQueryBuilder('scanHistory')
      .leftJoinAndSelect('scanHistory.orderItem', 'orderItem')
      .leftJoinAndSelect('orderItem.product', 'product')
      .leftJoinAndSelect('product.translations', 'translations')
      .leftJoinAndSelect('scanHistory.scanner', 'scanner')
      .leftJoinAndSelect('scanner.profile', 'profile');

    if (scannerSearch) {
      queryBuilder.andWhere(
        'scanner.email LIKE :scannerSearch OR profile.firstName LIKE :scannerSearch OR profile.lastName LIKE :scannerSearch',
        { scannerSearch: `%${scannerSearch}%` }
      );
    }

    if (startDate) {
      queryBuilder.andWhere('scanHistory.scannedAt >= :startDate', { 
        startDate: startDate.toISOString() 
      });
    }

    if (endDate) {
      queryBuilder.andWhere('scanHistory.scannedAt <= :endDate', { 
        endDate: endDate.toISOString() 
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(orderItem.qrCode LIKE :search OR product.id::text LIKE :search OR translations.title LIKE :search)',
        { search: `%${search}%` }
      );
    }
    
    // Lọc theo trạng thái sử dụng
    if (status) {
      if (status === 'first') {
        // Chỉ hiển thị lần quét đầu tiên
        queryBuilder.andWhere('scanHistory.isFirstScan = true');
      } else if (status === 'used') {
        // Hiển thị các lần quét không phải lần đầu
        queryBuilder.andWhere('scanHistory.isFirstScan = false');
      }
    }

    const [items, total] = await queryBuilder
      .orderBy('scanHistory.scannedAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    // Tính toán scanCount cho mỗi bản ghi
    const enhancedItems = await Promise.all(
      items.map(async (scanHistory) => {
        // Đếm số lần quét cho vé (orderItemId) tính đến thời điểm của lượt quét này
        const scanPosition = await this.scanHistoryRepository.count({
          where: {
            orderItemId: scanHistory.orderItemId,
            scannedAt: LessThanOrEqual(scanHistory.scannedAt),
          },
        });

        // Trả về bản ghi đã được tính scanCount
        return {
          ...scanHistory,
          scanCount: scanPosition,
        };
      })
    );

    return { items: enhancedItems, total };
  }

  /**
   * Lấy lịch sử quét vé với phân trang và tìm kiếm
   */
  async getScanHistory(
    page: number = 1,
    limit: number = 10,
    query?: string
  ): Promise<ScanHistoryResponse> {
    console.log('getScanHistory called with:', { page, limit, query });
    
    try {
      const queryBuilder = this.scanHistoryRepository
        .createQueryBuilder('history')
        .leftJoinAndSelect('history.orderItem', 'orderItem')
        .leftJoinAndSelect('orderItem.product', 'product')
        .leftJoinAndSelect('orderItem.order', 'order')
        .leftJoinAndSelect('history.scanner', 'scanner')
        .leftJoinAndSelect('scanner.profile', 'profile');
      
      // Thêm điều kiện tìm kiếm nếu có
      if (query) {
        queryBuilder.where(
          'orderItem.qrCode LIKE :query OR product.title LIKE :query',
          { query: `%${query}%` }
        );
      }
      
      // Đếm tổng số bản ghi
      const total = await queryBuilder.getCount();
      
      // Lấy dữ liệu phân trang
      const items = await queryBuilder
        .orderBy('history.scannedAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();
      
      return {
        items,
        total
      };
    } catch (error) {
      console.error('Error in getScanHistory:', error);
      throw error;
    }
  }
  
  /**
   * Lấy lịch sử quét cho một vé cụ thể
   */
  async getScanHistoryForOrderItem(orderItemId: number): Promise<OrderTicketScanHistory[]> {
    console.log('getScanHistoryForOrderItem called with orderItemId:', orderItemId);
    
    try {
      const histories = await this.scanHistoryRepository.find({
        where: { orderItemId },
        relations: ['scanner', 'scanner.profile'],
        order: { scannedAt: 'DESC' }
      });
      
      // Tính toán scanCount cho mỗi bản ghi
      const enhancedHistories = await Promise.all(
        histories.map(async (scanHistory) => {
          // Đếm số lần quét cho vé (orderItemId) tính đến thời điểm của lượt quét này
          const scanPosition = await this.scanHistoryRepository.count({
            where: {
              orderItemId: scanHistory.orderItemId,
              scannedAt: LessThanOrEqual(scanHistory.scannedAt),
            },
          });

          // Trả về bản ghi đã được tính scanCount
          return {
            ...scanHistory,
            scanCount: scanPosition,
          };
        })
      );
      
      return enhancedHistories;
    } catch (error) {
      console.error('Error in getScanHistoryForOrderItem:', error);
      throw error;
    }
  }

  /**
   * Tìm lịch sử quét của một vé cụ thể với phân trang và tìm kiếm
   */
  async findScanHistoryForOrderItem(options: {
    orderItemId: number;
    page?: number;
    pageSize?: number;
    search?: string;
    scannerSearch?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
  }): Promise<{ items: OrderTicketScanHistory[]; total: number }> {
    const { orderItemId, page = 1, pageSize = 10, search, scannerSearch, startDate, endDate, status } = options;

    const queryBuilder = this.scanHistoryRepository
      .createQueryBuilder('scanHistory')
      .leftJoinAndSelect('scanHistory.scanner', 'scanner')
      .leftJoinAndSelect('scanner.profile', 'profile')
      .where('scanHistory.orderItemId = :orderItemId', { orderItemId });

    // Thêm điều kiện tìm kiếm theo người quét (scanner)
    if (search || scannerSearch) {
      const searchTerm = search || scannerSearch;
      queryBuilder.andWhere(
        '(scanner.email LIKE :searchTerm OR profile.firstName LIKE :searchTerm OR profile.lastName LIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` }
      );
    }

    // Thêm điều kiện tìm kiếm theo ngày
    if (startDate) {
      queryBuilder.andWhere('scanHistory.scannedAt >= :startDate', { 
        startDate: startDate.toISOString() 
      });
    }

    if (endDate) {
      queryBuilder.andWhere('scanHistory.scannedAt <= :endDate', { 
        endDate: endDate.toISOString() 
      });
    }
    
    // Lọc theo trạng thái sử dụng
    if (status) {
      if (status === 'first') {
        queryBuilder.andWhere('scanHistory.isFirstScan = true');
      } else if (status === 'used') {
        queryBuilder.andWhere('scanHistory.isFirstScan = false');
      }
    }

    // Đếm tổng số bản ghi
    const total = await queryBuilder.getCount();

    // Lấy dữ liệu với phân trang
    const items = await queryBuilder
      .orderBy('scanHistory.scannedAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    // Tính toán scanCount cho mỗi bản ghi
    const enhancedItems = await Promise.all(
      items.map(async (scanHistory) => {
        // Đếm số lần quét cho vé (orderItemId) tính đến thời điểm của lượt quét này
        const scanPosition = await this.scanHistoryRepository.count({
          where: {
            orderItemId: scanHistory.orderItemId,
            scannedAt: LessThanOrEqual(scanHistory.scannedAt),
          },
        });

        // Trả về bản ghi đã được tính scanCount
        return {
          ...scanHistory,
          scanCount: scanPosition,
        };
      })
    );

    return { items: enhancedItems, total };
  }
} 
