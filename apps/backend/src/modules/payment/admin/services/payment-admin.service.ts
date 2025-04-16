import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from '../../entities/payment-method.entity';
import { PaymentTransaction } from '../../entities/payment-transaction.entity';
import { Between } from 'typeorm';

@Injectable()
export class PaymentAdminService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepository: Repository<PaymentMethod>,
    @InjectRepository(PaymentTransaction)
    private readonly paymentTransactionRepository: Repository<PaymentTransaction>
  ) {}

  async getAllPaymentMethods() {
    return this.paymentMethodRepository.find();
  }

  async updatePaymentMethodStatus(id: number, isActive: boolean) {
    await this.paymentMethodRepository.update(id, { is_active: isActive });
    return this.paymentMethodRepository.findOne({ where: { id } });
  }

  async getAllTransactions() {
    return this.paymentTransactionRepository.find({
      relations: ['payment_method'],
      order: { created_at: 'DESC' }
    });
  }

  async getTransactionById(id: string) {
    return this.paymentTransactionRepository.findOne({
      where: { id },
      relations: ['payment_method']
    });
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date) {
    return this.paymentTransactionRepository.find({
      where: {
        created_at: Between(startDate, endDate)
      },
      relations: ['payment_method'],
      order: { created_at: 'DESC' }
    });
  }
} 