import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../../entities/service.entity';

@Injectable()
export class ServiceAdminService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  async findAll(): Promise<Service[]> {
    return this.serviceRepository.find({
      order: {
        order: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Service> {
    return this.serviceRepository.findOne({
      where: { id },
    });
  }

  async create(serviceData: Partial<Service>): Promise<Service> {
    const service = this.serviceRepository.create(serviceData);
    return this.serviceRepository.save(service);
  }

  async update(id: number, serviceData: Partial<Service>): Promise<Service> {
    await this.serviceRepository.update(id, serviceData);
    return this.serviceRepository.findOne({
      where: { id },
    });
  }

  async remove(id: number): Promise<void> {
    await this.serviceRepository.delete(id);
  }
} 