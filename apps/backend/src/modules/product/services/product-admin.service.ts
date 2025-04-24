import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from '../entities/product.entity';

interface GetProductsParams {
  page: number;
  limit: number;
  search?: string;
  published?: boolean | null;
}

@Injectable()
export class ProductAdminService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getProducts({ page, limit, search, published }: GetProductsParams) {
    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.translations', 'translations')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('variants.translations', 'variantTranslations');

    if (search) {
      queryBuilder.andWhere('translations.name ILIKE :search', { search: `%${search}%` });
    }

    if (published !== null) {
      queryBuilder.andWhere('product.published = :published', { published });
    }

    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
} 