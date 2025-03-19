import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../../entities/service.entity';
import { ServiceTranslation } from '../../entities/service-translation.entity';

@Injectable()
export class ServiceFrontendService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceTranslation)
    private readonly serviceTranslationRepository: Repository<ServiceTranslation>,
  ) {}

  async findAll(locale?: string) {
    const query = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.translations', 'translations')
      .where('service.isActive = :isActive', { isActive: true })
      .orderBy('service.order', 'ASC');

    if (locale) {
      query.andWhere('translations.locale = :locale', { locale });
    }

    return query.getMany();
  }

  async findOne(id: number, locale?: string) {
    const query = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.translations', 'translations')
      .where('service.id = :id', { id })
      .andWhere('service.isActive = :isActive', { isActive: true });

    if (locale) {
      query.andWhere('translations.locale = :locale', { locale });
    }

    return query.getOne();
  }

  async findBySlug(slug: string, locale?: string) {
    const query = this.serviceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.translations', 'translations')
      .where('translations.slug = :slug', { slug })
      .andWhere('service.isActive = :isActive', { isActive: true });

    if (locale) {
      query.andWhere('translations.locale = :locale', { locale });
    }

    return query.getOne();
  }
} 