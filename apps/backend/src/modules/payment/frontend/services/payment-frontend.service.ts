import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from '../../entities/payment-method.entity';
import { PaymentTransaction } from '../../entities/payment-transaction.entity';
import { PaymentGatewayService } from '../../../payment-gateway/payment-gateway.service';
import { CreatePaymentDto } from '../../dto/create-payment.dto';
import { PaymentStatus } from '../../entities/payment-transaction.entity';
import { PAYMENT_GATEWAY_TOKEN } from '../../../payment-gateway/payment-gateway.module';
import { OrderFrontendService } from '../../../order/frontend/services/order-frontend.service';

@Injectable()
export class PaymentFrontendService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(PaymentTransaction)
    private readonly paymentTransactionRepository: Repository<PaymentTransaction>,
    @Inject(PAYMENT_GATEWAY_TOKEN)
    private readonly paymentGatewayService: PaymentGatewayService,
    @Inject(forwardRef(() => OrderFrontendService))
    private readonly orderFrontendService: OrderFrontendService
  ) {}

  async getActivePaymentMethods() {
    return this.paymentMethodRepository.find({
      where: { is_active: true }
    });
  }

  async createPayment(createPaymentDto: CreatePaymentDto) {
    const paymentMethod = await this.paymentMethodRepository.findOne({
      where: { id: createPaymentDto.payment_method_id, is_active: true }
    });

    if (!paymentMethod) {
      throw new Error('Payment method not found or inactive');
    }

    // Create transaction record
    const transaction = this.paymentTransactionRepository.create({
      ...createPaymentDto,
      status: PaymentStatus.PENDING,
    });

    await this.paymentTransactionRepository.save(transaction);

    // Get order to get orderCode for PayOS
    const orderId = transaction.order_id;
    const order = await this.orderFrontendService.findOrderById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Get payment info from gateway
    const paymentInfo = await this.paymentGatewayService.createPayment({
      order_code: order.orderCode,
      amount: transaction.amount,
      description: transaction.description,
      return_url: createPaymentDto.return_url,
      cancel_url: createPaymentDto.cancel_url
    });

    // Update transaction with payment gateway info
    await this.paymentTransactionRepository.update(transaction.id, {
      payment_url: paymentInfo.payment_url,
      qr_code: paymentInfo.qr_code,
      metadata: paymentInfo.metadata as any
    });

    return {
      ...transaction,
      payment_url: paymentInfo.payment_url,
      qr_code: paymentInfo.qr_code
    };
  }

  async getTransactionByOrderId(orderId: number) {
    return this.paymentTransactionRepository.findOne({
      where: { order_id: orderId },
      relations: ['paymentMethod']
    });
  }

  async getTransactionByOrderCode(orderCode: string) {
    // First find the order by code
    const order = await this.orderFrontendService.findOrderByCode(orderCode);
    if (!order) {
      throw new Error('Order not found');
    }

    // Then find the transaction by order id
    return this.getTransactionByOrderId(order.id);
  }

  async handlePaymentWebhook(payload: any) {
    const { order_id, status } = payload;
    
    // Find transaction by order code
    const transaction = await this.getTransactionByOrderCode(order_id);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    let paymentStatus: PaymentStatus;
    switch (status) {
      case 'PAID':
        paymentStatus = PaymentStatus.COMPLETED;
        break;
      case 'CANCELLED':
        paymentStatus = PaymentStatus.CANCELLED;
        break;
      case 'FAILED':
        paymentStatus = PaymentStatus.FAILED;
        break;
      default:
        paymentStatus = PaymentStatus.PENDING;
    }

    await this.paymentTransactionRepository.update(transaction.id, {
      status: paymentStatus,
      paid_at: paymentStatus === PaymentStatus.COMPLETED ? new Date() : null,
      cancelled_at: paymentStatus === PaymentStatus.CANCELLED ? new Date() : null,
      metadata: { ...transaction.metadata, webhook_payload: payload }
    });

    return this.getTransactionByOrderId(transaction.order_id);
  }
} 