import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../entities/order.entity';
import { OrderItem } from '../../entities/order-item.entity';
import { PaymentGatewayInterface, CreatePaymentRequest, PaymentItem } from '../../../payment-gateway/interfaces/payment-gateway.interface';
import { PAYMENT_GATEWAY_TOKEN } from '../../../payment-gateway/payment-gateway.module';
import { Address } from '../../entities/order.entity';

@Injectable()
export class OrderFrontendService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @Inject(PAYMENT_GATEWAY_TOKEN)
    private readonly paymentGateway: PaymentGatewayInterface
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
    return this.orderItemRepository.save(orderItems);
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

    // Map order items to PayOS items format
    const paymentItems: PaymentItem[] = orderItems.map(item => ({
      name: this.getProductName(item.product),
      quantity: item.quantity,
      price: Number(item.unitPrice)
    }));

    // Get buyer information from shipping address or order input
    const buyerInfo = orderData.shippingAddress || {
      fullName: '',
      phone: orderData.phoneNumber,
      email: orderData.email
    };

    // Initialize payment
    const payment = await this.paymentGateway.createPayment({
      order_id: order.id.toString(),
      amount: Math.round(Number(orderData.totalAmount)),
      items: paymentItems,
      buyer_name: buyerInfo.fullName,
      buyer_phone: buyerInfo.phone,
      buyer_email: buyerInfo.email,
      buyer_address: orderData.shippingAddress?.address,
      ...paymentRequest
    });

    return {
      order: {
        ...order,
        items: orderItems
      },
      payment
    };
  }
} 