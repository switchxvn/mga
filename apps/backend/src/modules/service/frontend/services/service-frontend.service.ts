import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../../entities/service.entity';
import { ServiceTranslation } from '../../entities/service-translation.entity';

interface FindAndCountOptions {
  search?: string;
  categories?: number[];
  isFeatured?: boolean;
  isNew?: boolean;
  sortBy?: 'newest' | 'oldest' | 'name_asc' | 'name_desc';
  page: number;
  limit: number;
  locale?: string;
}

@Injectable()
export class ServiceFrontendService {
  private readonly logger = new Logger(ServiceFrontendService.name);

  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceTranslation)
    private readonly serviceTranslationRepository: Repository<ServiceTranslation>,
  ) {}

  async findAndCount(options: FindAndCountOptions): Promise<[Service[], number]> {
    try {
      this.logger.debug(`Finding services with options: ${JSON.stringify(options)}`);

      const query = this.serviceRepository
        .createQueryBuilder('service')
        .leftJoinAndSelect('service.translations', 'translations')
        .where('service.isActive = :isActive', { isActive: true });

      // Apply search filter
      if (options.search) {
        query.andWhere('(LOWER(translations.title) LIKE LOWER(:search) OR LOWER(translations.description) LIKE LOWER(:search))', {
          search: `%${options.search}%`,
        });
      }

      // Apply category filter
      if (options.categories && options.categories.length > 0) {
        query.andWhere('categories.id IN (:...categoryIds)', {
          categoryIds: options.categories,
        });
      }

      // Apply featured filter
      if (options.isFeatured !== undefined) {
        query.andWhere('service.isFeatured = :isFeatured', {
          isFeatured: options.isFeatured,
        });
      }

      // Apply new filter
      if (options.isNew !== undefined) {
        query.andWhere('service.isNew = :isNew', {
          isNew: options.isNew,
        });
      }

      // Apply locale filter
      if (options.locale) {
        query.andWhere('translations.locale = :locale', { locale: options.locale });
      }

      // Apply sorting
      switch (options.sortBy) {
        case 'oldest':
          query.orderBy('service.createdAt', 'ASC');
          break;
        case 'name_asc':
          query.orderBy('translations.title', 'ASC');
          break;
        case 'name_desc':
          query.orderBy('translations.title', 'DESC');
          break;
        case 'newest':
        default:
          query.orderBy('service.createdAt', 'DESC');
          break;
      }

      // Apply pagination
      const skip = (options.page - 1) * options.limit;
      query.skip(skip);
      query.take(options.limit);

      // Log the generated SQL for debugging
      const [sql, parameters] = query.getQueryAndParameters();
      this.logger.debug(`Generated SQL: ${sql}`);
      this.logger.debug(`Parameters: ${JSON.stringify(parameters)}`);

      const [items, total] = await query.getManyAndCount();
      
      this.logger.debug(`Found ${items.length} services out of ${total} total`);
      
      return [items, total];
    } catch (error) {
      this.logger.error('Error in findAndCount:', error);
      this.logger.error('Stack trace:', error.stack);
      throw error;
    }
  }

  async findAll(locale?: string) {
    try {
      const query = this.serviceRepository
        .createQueryBuilder('service')
        .leftJoinAndSelect('service.translations', 'translations')
        .leftJoinAndSelect('service.categories', 'categories')
        .leftJoinAndSelect('categories.translations', 'categoryTranslations')
        .where('service.isActive = :isActive', { isActive: true })
        .orderBy('service.order', 'ASC');

      if (locale) {
        query.andWhere('translations.locale = :locale', { locale });
      }

      return query.getMany();
    } catch (error) {
      this.logger.error('Error in findAll:', error);
      throw error;
    }
  }

  async findOne(id: number, locale?: string) {
    try {
      const query = this.serviceRepository
        .createQueryBuilder('service')
        .leftJoinAndSelect('service.translations', 'translations')
        .leftJoinAndSelect('service.categories', 'categories')
        .leftJoinAndSelect('categories.translations', 'categoryTranslations')
        .where('service.id = :id', { id })
        .andWhere('service.isActive = :isActive', { isActive: true });

      if (locale) {
        query.andWhere('translations.locale = :locale', { locale });
        query.andWhere('categoryTranslations.locale = :locale', { locale });
      }

      return query.getOne();
    } catch (error) {
      this.logger.error(`Error in findOne with id ${id}:`, error);
      throw error;
    }
  }

  async findBySlug(slug: string, locale?: string) {
    try {
      const query = this.serviceRepository
        .createQueryBuilder('service')
        .leftJoinAndSelect('service.translations', 'translations')
        .leftJoinAndSelect('service.categories', 'categories')
        .leftJoinAndSelect('categories.translations', 'categoryTranslations')
        .where('translations.slug = :slug', { slug })
        .andWhere('service.isActive = :isActive', { isActive: true });

      if (locale) {
        query.andWhere('translations.locale = :locale', { locale });
      }

      return query.getOne();
    } catch (error) {
      this.logger.error(`Error in findBySlug with slug ${slug}:`, error);
      throw error;
    }
  }
} 