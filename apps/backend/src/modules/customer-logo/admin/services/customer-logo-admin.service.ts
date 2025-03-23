import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerLogo } from '../../entities/customer-logo.entity';

@Injectable()
export class CustomerLogoAdminService {
  constructor(
    @InjectRepository(CustomerLogo)
    private readonly customerLogoRepository: Repository<CustomerLogo>,
  ) {}

  async create(data: Partial<CustomerLogo>) {
    const customerLogo = this.customerLogoRepository.create(data);
    return await this.customerLogoRepository.save(customerLogo);
  }

  async update(id: number, data: Partial<CustomerLogo>) {
    await this.customerLogoRepository.update(id, data);
    return await this.customerLogoRepository.findOne({ where: { id } });
  }

  async delete(id: number) {
    return await this.customerLogoRepository.delete(id);
  }

  async findAll() {
    return await this.customerLogoRepository.find({
      order: { order: 'ASC' },
    });
  }

  async findOne(id: number) {
    return await this.customerLogoRepository.findOne({ where: { id } });
  }

  async updateOrder(id: number, order: number) {
    return await this.customerLogoRepository.update(id, { order });
  }
} 