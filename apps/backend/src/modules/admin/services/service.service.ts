import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service, ServiceTranslation } from '@ecommerce/database';

interface CreateServiceDto {
  icon: string;
  order?: number;
  isActive?: boolean;
  translations: Array<{
    title: string;
    description?: string;
    shortDescription?: string;
    locale: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
  }>;
}

interface UpdateServiceDto {
  icon?: string;
  order?: number;
  isActive?: boolean;
  translations?: Array<{
    title: string;
    description?: string;
    shortDescription?: string;
    locale: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
  }>;
}

@Injectable()
export class AdminServiceService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceTranslation)
    private readonly translationRepository: Repository<ServiceTranslation>,
  ) {}

  async findAll() {
    return this.serviceRepository.find({
      relations: ['translations'],
      order: { order: 'ASC' },
    });
  }

  async findOne(id: number) {
    return this.serviceRepository.findOne({
      where: { id },
      relations: ['translations'],
    });
  }

  async create(dto: CreateServiceDto) {
    const service = this.serviceRepository.create({
      icon: dto.icon,
      order: dto.order || 0,
      isActive: dto.isActive ?? true,
    });

    // Save service first to get the ID
    const savedService = await this.serviceRepository.save(service);

    // Create translations
    const translations = dto.translations.map(translation =>
      this.translationRepository.create({
        ...translation,
        serviceId: savedService.id,
      }),
    );

    // Save translations
    savedService.translations = await this.translationRepository.save(translations);

    return savedService;
  }

  async update(id: number, dto: UpdateServiceDto) {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['translations'],
    });

    if (!service) {
      return null;
    }

    // Update basic service info
    if (dto.icon !== undefined) service.icon = dto.icon;
    if (dto.order !== undefined) service.order = dto.order;
    if (dto.isActive !== undefined) service.isActive = dto.isActive;

    // Update translations if provided
    if (dto.translations) {
      // Delete existing translations
      await this.translationRepository.delete({ serviceId: id });

      // Create new translations
      const translations = dto.translations.map(translation =>
        this.translationRepository.create({
          ...translation,
          serviceId: id,
        }),
      );

      // Save new translations
      service.translations = await this.translationRepository.save(translations);
    }

    // Save service
    return this.serviceRepository.save(service);
  }

  async remove(id: number) {
    const service = await this.serviceRepository.findOne({
      where: { id },
    });

    if (!service) {
      return false;
    }

    await this.serviceRepository.remove(service);
    return true;
  }
} 