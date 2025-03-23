import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerLogo } from '../../entities/customer-logo.entity';

@Injectable()
export class CustomerLogoFrontendService {
  constructor(
    @InjectRepository(CustomerLogo)
    private readonly customerLogoRepository: Repository<CustomerLogo>,
  ) {}

  async findAll() {
    return await this.customerLogoRepository.find({
      where: { isActive: true },
      order: { order: 'ASC' },
    });
  }
} 