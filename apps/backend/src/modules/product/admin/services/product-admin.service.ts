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

  async getProducts({ page, limit, search, published }: { page: number; limit: number; search?: string; published?: boolean | null }) {
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

  async findOne(id: number): Promise<Product> {
    return this.productRepository.findOne({
      where: { id },
      relations: [
        'translations', 
        'categories', 
        'variants', 
        'variants.translations',
        'specifications',
        'specifications.translations'
      ],
    });
  }

  async create(productData: Partial<Product>): Promise<Product> {
    const product = this.productRepository.create(productData);
    return this.productRepository.save(product);
  }

  async update(id: number, productData: Partial<Product>): Promise<Product> {
    // Tách dữ liệu relations và các trường khác ra khỏi productData
    const { translations, categories, ...productDetails } = productData;
    
    // Lấy product hiện tại với relations cần thiết
    const existingProduct = await this.productRepository.findOne({
      where: { id },
      relations: ['translations', 'categories'],
    });
    
    if (!existingProduct) {
      throw new Error(`Product with ID ${id} not found`);
    }
    
    // Cập nhật thông tin cơ bản của product
    Object.assign(existingProduct, productDetails);
    
    // Xử lý translations nếu có
    if (translations && translations.length > 0) {
      // Đối với mỗi translation mới, tìm và cập nhật hoặc thêm mới
      if (existingProduct.translations) {
        for (const newTranslation of translations) {
          const existingTranslation = existingProduct.translations.find(
            t => t.locale === newTranslation.locale
          );
          
          if (existingTranslation) {
            // Cập nhật translation hiện có
            Object.assign(existingTranslation, newTranslation);
          } else {
            // Thêm translation mới
            const translationToAdd = this.productTranslationRepository.create({
              ...newTranslation,
              productId: id
            });
            existingProduct.translations.push(translationToAdd);
          }
        }
      } else {
        // Nếu chưa có translations, tạo mới
        existingProduct.translations = translations.map(translation => 
          this.productTranslationRepository.create({
            ...translation,
            productId: id
          })
        );
      }
    }
    
    // Xử lý categories nếu có
    if (categories) {
      existingProduct.categories = categories;
    }
    
    // Lưu toàn bộ product với relations
    return this.productRepository.save(existingProduct);
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