import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';

@Injectable()
export class OrderAdminService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>
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

  async updatePaymentStatus(id: number, paymentStatus: PaymentStatus): Promise<Order> {
    await this.orderRepository.update(id, { paymentStatus });
    return this.findOrderById(id);
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
} 