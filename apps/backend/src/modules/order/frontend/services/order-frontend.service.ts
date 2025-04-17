import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { PaymentGatewayInterface, CreatePaymentRequest, PaymentItem } from '../../../payment-gateway/interfaces/payment-gateway.interface';
import { PAYMENT_GATEWAY_TOKEN } from '../../../payment-gateway/payment-gateway.module';
import { Address } from '../../entities/order.entity';
import { PaymentFrontendService } from '../../../payment/frontend/services/payment-frontend.service';

@Injectable()
export class OrderFrontendService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @Inject(PAYMENT_GATEWAY_TOKEN)
    private readonly paymentGateway: PaymentGatewayInterface,
    private readonly paymentFrontendService: PaymentFrontendService
  ) {}

  async findOrderById(id: number): Promise<Order> {
    return this.orderRepository.findOne({
      where: { id },
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

  async createOrderItems(items: Partial<OrderItem>[]): Promise<OrderItem[]> {
    const orderItems = this.orderItemRepository.create(items);
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
    const orderItems = await this.createOrderItems(
      items.map(item => ({
        ...item,
        orderId: order.id
      }))
    );

    // Create payment transaction
    const paymentTransaction = await this.paymentFrontendService.createPayment({
      payment_method_id: orderInput.payment_method_id,
      order_id: order.id.toString(),
      amount: Math.round(Number(orderData.totalAmount)),
      description: `Payment for order #${order.id}`,
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
} 