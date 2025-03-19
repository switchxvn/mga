import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '@ecommerce/database';

@Injectable()
export class FrontendServiceService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async findAll(locale?: string) {
    const services = await this.serviceRepository.find({
      where: { isActive: true },
      relations: ['translations'],
      order: { order: 'ASC' },
    });

    if (locale) {
      return services.map(service => ({
        ...service,
        currentTranslation: service.translations?.find(t => t.locale === locale) || service.translations?.[0]
      }));
    }

    return services;
  }

  async findOne(id: number, locale?: string) {
    const service = await this.serviceRepository.findOne({
      where: { id, isActive: true },
      relations: ['translations'],
    });

    if (!service) {
      return null;
    }

    if (locale) {
      return {
        ...service,
        currentTranslation: service.translations?.find(t => t.locale === locale) || service.translations?.[0]
      };
    }

    return service;
  }
} 