import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { OrderRefund, RefundStatus } from '../../entities/order-refund.entity';
import { OrderRefundItem } from '../../entities/order-refund-item.entity';
import { Product } from '../../../product/entities/product.entity';

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
} 