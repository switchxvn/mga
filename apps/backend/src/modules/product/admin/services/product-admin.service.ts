import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { ProductTranslation } from '../../entities/product-translation.entity';

@Injectable()
export class ProductAdminService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductTranslation)
    private productTranslationRepository: Repository<ProductTranslation>,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['translations'],
    });
  }

  async findOne(id: number): Promise<Product> {
    return this.productRepository.findOne({
      where: { id },
      relations: ['translations'],
    });
  }

  async create(productData: Partial<Product>): Promise<Product> {
    const product = this.productRepository.create(productData);
    return this.productRepository.save(product);
  }

  async update(id: number, productData: Partial<Product>): Promise<Product> {
    await this.productRepository.update(id, productData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.productRepository.delete(id);
  }

  async createTranslation(translation: Partial<ProductTranslation>): Promise<ProductTranslation> {
    const newTranslation = this.productTranslationRepository.create(translation);
    return this.productTranslationRepository.save(newTranslation);
  }

  async updateTranslation(id: number, translation: Partial<ProductTranslation>): Promise<ProductTranslation> {
    await this.productTranslationRepository.update(id, translation);
    return this.productTranslationRepository.findOne({ where: { id } });
  }

  async removeTranslation(id: number): Promise<void> {
    await this.productTranslationRepository.delete(id);
  }
} 