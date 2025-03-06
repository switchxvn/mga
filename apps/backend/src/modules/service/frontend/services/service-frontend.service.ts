import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../../entities/service.entity';

@Injectable()
export class ServiceFrontendService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  async findAll(): Promise<Service[]> {
    return this.serviceRepository.find({
      where: { isActive: true },
      order: {
        order: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Service> {
    return this.serviceRepository.findOne({
      where: { id, isActive: true },
    });
  }
} 