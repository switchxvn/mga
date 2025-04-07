import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, FindOptionsWhere, In, IsNull, Not } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { ProductTranslation } from '../../entities/product-translation.entity';
import { ProductVariant } from '../../entities/product-variant.entity';
import { ProductVariantTranslation } from '../../entities/product-variant-translation.entity';

export interface ProductFilterOptions {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  includeNullPrice?: boolean;
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
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductTranslation)
    private readonly productTranslationRepository: Repository<ProductTranslation>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductVariantTranslation)
    private readonly productVariantTranslationRepository: Repository<ProductVariantTranslation>,
  ) {}

  async findAll(locale: string = 'en', options?: ProductFilterOptions): Promise<PaginatedProducts> {
    const {
      search,
      minPrice,
      maxPrice,
      includeNullPrice,
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
      if (includeNullPrice) {
        // Sử dụng queryBuilder để xử lý điều kiện OR với null
        // Sẽ được xử lý bên dưới
      } else {
        where.price = Between(minPrice, maxPrice);
      }
    } else if (minPrice !== undefined) {
      if (includeNullPrice) {
        // Sẽ được xử lý bên dưới
      } else {
        where.price = Between(minPrice, 999999999);
      }
    } else if (maxPrice !== undefined) {
      if (includeNullPrice) {
        // Sẽ được xử lý bên dưới
      } else {
        where.price = Between(0, maxPrice);
      }
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

    // Xử lý lọc giá với includeNullPrice
    if (includeNullPrice) {
      if (minPrice !== undefined && maxPrice !== undefined) {
        queryBuilder.andWhere('(product.price BETWEEN :minPrice AND :maxPrice OR product.price IS NULL)', {
          minPrice,
          maxPrice
        });
      } else if (minPrice !== undefined) {
        queryBuilder.andWhere('(product.price >= :minPrice OR product.price IS NULL)', {
          minPrice
        });
      } else if (maxPrice !== undefined) {
        queryBuilder.andWhere('(product.price <= :maxPrice OR product.price IS NULL)', {
          maxPrice
        });
      }
    }

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
    
    // Add logging for debugging
    console.log('Pagination debug:', {
      total,
      limit,
      page,
      calculatedTotalPages: Math.ceil(total / limit)
    });
    
    // Ensure limit is a positive number
    const validLimit = Math.max(1, limit);
    
    // Calculate total pages, ensuring at least 1 page if there are items
    const totalPages = total > 0 ? Math.max(1, Math.ceil(total / validLimit)) : 0;

    return {
      items,
      total,
      page,
      limit: validLimit,
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

  /**
   * Find product by slug in translations
   */
  async findBySlug(slug: string, locale: string = 'en'): Promise<Product | null> {
    const translation = await this.productTranslationRepository.findOne({
      where: { slug, locale },
      relations: ['product', 'product.translations', 'product.variants', 'product.variants.translations'],
    });

    if (!translation) {
      // Try to find in any locale if not found in specified locale
      const anyTranslation = await this.productTranslationRepository.findOne({
        where: { slug },
        relations: ['product', 'product.translations', 'product.variants', 'product.variants.translations'],
      });
      
      return anyTranslation?.product || null;
    }

    return translation.product;
  }

  async findById(id: number, locale: string = 'en'): Promise<Product> {
    return this.productRepository.findOne({
      where: { id, published: true },
      relations: ['translations', 'categories', 'variants', 'variants.translations'],
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

  /**
   * Get translation for a product
   */
  getTranslation(product: Product, locale: string = 'en'): ProductTranslation | null {
    if (!product.translations || product.translations.length === 0) {
      return null;
    }

    const translation = product.translations.find(t => t.locale === locale);
    return translation || product.translations[0];
  }

  /**
   * Get translation for a product variant
   */
  getVariantTranslation(variant: ProductVariant, locale: string = 'en'): ProductVariantTranslation | null {
    if (!variant.translations || variant.translations.length === 0) {
      return null;
    }

    const translation = variant.translations.find(t => t.locale === locale);
    return translation || variant.translations[0];
  }

  /**
   * Format price to VND
   */
  formatPrice(price: number | null): string {
    if (price === null) {
      return 'Liên hệ';
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }
}