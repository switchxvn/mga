import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { ProductTranslation } from '../../entities/product-translation.entity';

@Injectable()
export class ProductFrontendService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductTranslation)
    private productTranslationRepository: Repository<ProductTranslation>,
  ) {}

  async findAll(locale: string = 'en'): Promise<Product[]> {
    return this.productRepository.find({
      where: { published: true },
      relations: ['translations'],
    });
  }

  async findFeatured(locale: string = 'en'): Promise<Product[]> {
    return this.productRepository.find({
      where: { published: true, isFeatured: true },
      relations: ['translations'],
      take: 8,
    });
  }

  async findNew(locale: string = 'en'): Promise<Product[]> {
    return this.productRepository.find({
      where: { published: true, isNew: true },
      relations: ['translations'],
      take: 8,
    });
  }

  async findOnSale(locale: string = 'en'): Promise<Product[]> {
    return this.productRepository.find({
      where: { published: true, isSale: true },
      relations: ['translations'],
      take: 8,
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