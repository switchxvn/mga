import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { OrderItem, ProductType } from '../../entities/order-item.entity';
import { OrderRefund, RefundStatus } from '../../entities/order-refund.entity';
import { OrderRefundItem } from '../../entities/order-refund-item.entity';
import { OrderTicketScanHistory } from '../../entities/order-ticket-scan-history.entity';
import { Product } from '../../../product/entities/product.entity';
import { OrderStatus, PaymentStatus } from '@ew/shared';

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
  items: OrderTicketScanHistory[];
  total: number;
}

@Injectable()
export class OrderAdminService {
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
    private readonly productRepository: Repository<Product>
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

    return this.orderRefundRepository.save(refund);
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

    return { items, total };
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
      
      return histories;
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

    return { items, total };
  }
} 