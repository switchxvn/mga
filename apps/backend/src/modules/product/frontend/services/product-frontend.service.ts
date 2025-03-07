import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, FindOptionsWhere, In } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { ProductTranslation } from '../../entities/product-translation.entity';

export interface ProductFilterOptions {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  categories?: number[];
  isFeatured?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'oldest';
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ProductFrontendService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductTranslation)
    private productTranslationRepository: Repository<ProductTranslation>,
  ) {}

  async findAll(locale: string = 'en', options?: ProductFilterOptions): Promise<PaginatedProducts> {
    const {
      search,
      minPrice,
      maxPrice,
      categories,
      isFeatured,
      isNew,
      isSale,
      sortBy = 'newest',
      page = 1,
      limit = 12,
    } = options || {};

    // Build where conditions
    const where: FindOptionsWhere<Product> = { published: true };
    
    // Add filters
    if (minPrice !== undefined && maxPrice !== undefined) {
      where.price = Between(minPrice, maxPrice);
    } else if (minPrice !== undefined) {
      where.price = Between(minPrice, 999999999);
    } else if (maxPrice !== undefined) {
      where.price = Between(0, maxPrice);
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (isNew !== undefined) {
      where.isNew = isNew;
    }

    if (isSale !== undefined) {
      where.isSale = isSale;
    }

    // Build query
    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.translations', 'translations')
      .where(where);

    // Add search condition
    if (search) {
      queryBuilder.andWhere(
        '(translations.title ILIKE :search OR translations.content ILIKE :search OR translations.shortDescription ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Add category filter
    if (categories && categories.length > 0) {
      queryBuilder.innerJoin('product.categories', 'category')
        .andWhere('category.id IN (:...categoryIds)', { categoryIds: categories });
    }

    // Add sorting
    switch (sortBy) {
      case 'price_asc':
        queryBuilder.orderBy('product.price', 'ASC', 'NULLS LAST');
        break;
      case 'price_desc':
        queryBuilder.orderBy('product.price', 'DESC', 'NULLS LAST');
        break;
      case 'oldest':
        queryBuilder.orderBy('product.createdAt', 'ASC');
        break;
      case 'newest':
      default:
        queryBuilder.orderBy('product.createdAt', 'DESC');
        break;
    }

    // Add pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Execute query
    const [items, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findFeatured(locale: string = 'en', limit: number = 8): Promise<Product[]> {
    return this.productRepository.find({
      where: { published: true, isFeatured: true },
      relations: ['translations'],
      take: limit,
    });
  }

  async findNew(locale: string = 'en', limit: number = 8): Promise<Product[]> {
    return this.productRepository.find({
      where: { published: true, isNew: true },
      relations: ['translations'],
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findOnSale(locale: string = 'en', limit: number = 8): Promise<Product[]> {
    return this.productRepository.find({
      where: { published: true, isSale: true },
      relations: ['translations'],
      take: limit,
    });
  }

  async findBySlug(slug: string, locale: string = 'en'): Promise<Product> {
    return this.productRepository.findOne({
      where: { slug, published: true },
      relations: ['translations'],
    });
  }

  async findById(id: number, locale: string = 'en'): Promise<Product> {
    return this.productRepository.findOne({
      where: { id, published: true },
      relations: ['translations'],
    });
  }

  async getMinMaxPrice(): Promise<{ min: number; max: number }> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('MIN(product.price)', 'min')
      .addSelect('MAX(product.price)', 'max')
      .where('product.published = :published', { published: true })
      .andWhere('product.price IS NOT NULL')
      .getRawOne();

    return {
      min: result?.min ? parseFloat(result.min) : 0,
      max: result?.max ? parseFloat(result.max) : 1000000,
    };
  }

  getTranslation(product: Product, locale: string = 'en'): ProductTranslation | null {
    if (!product || !product.translations || product.translations.length === 0) {
      return null;
    }

    const translation = product.translations.find(t => t.locale === locale);
    return translation || product.translations[0]; // Fallback to first translation if locale not found
  }

  formatPrice(price: number | null): string {
    if (price === null) {
      return 'Liên hệ';
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }
}