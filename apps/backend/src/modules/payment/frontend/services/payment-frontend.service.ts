import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from '../../entities/payment-method.entity';
import { PaymentTransaction } from '../../entities/payment-transaction.entity';
import { PaymentGatewayService } from '../../../payment-gateway/payment-gateway.service';
import { CreatePaymentDto } from '../../dto/create-payment.dto';
import { PaymentStatus } from '../../entities/payment-transaction.entity';
import { PAYMENT_GATEWAY_TOKEN } from '../../../payment-gateway/payment-gateway.module';

@Injectable()
export class PaymentFrontendService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(PaymentTransaction)
    private readonly paymentTransactionRepository: Repository<PaymentTransaction>,
    @Inject(PAYMENT_GATEWAY_TOKEN)
    private readonly paymentGatewayService: PaymentGatewayService
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
      status: PaymentStatus.PENDING
    });

    await this.paymentTransactionRepository.save(transaction);

    // Get payment info from gateway
    const paymentInfo = await this.paymentGatewayService.createPayment({
      order_id: transaction.order_id,
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

  async getTransactionByOrderId(orderId: string) {
    return this.paymentTransactionRepository.findOne({
      where: { order_id: orderId },
      relations: ['payment_method']
    });
  }

  async handlePaymentWebhook(payload: any) {
    const { order_id, status } = payload;

    const transaction = await this.getTransactionByOrderId(order_id);
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

    return this.getTransactionByOrderId(order_id);
  }
} 