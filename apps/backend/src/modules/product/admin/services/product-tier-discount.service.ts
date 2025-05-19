import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductTierDiscount } from '../../entities/product-tier-discount.entity';

// Tạm thời định nghĩa các DTO ở đây, sau này sẽ chuyển vào thư viện shared
class ProductTierDiscountCreateDto {
  productId?: number;
  productVariantId?: number;
  minQuantity: number;
  discountPercent?: number;
  discountAmount?: number;
  isActive?: boolean;
}

class ProductTierDiscountUpdateDto {
  productId?: number;
  productVariantId?: number;
  minQuantity?: number;
  discountPercent?: number;
  discountAmount?: number;
  isActive?: boolean;
}

@Injectable()
export class AdminProductTierDiscountService {
  constructor(
    @InjectRepository(ProductTierDiscount)
    private readonly productTierDiscountRepository: Repository<ProductTierDiscount>
  ) {}

  async findAllByProductId(productId: number): Promise<ProductTierDiscount[]> {
    return this.productTierDiscountRepository.find({
      where: { productId },
      order: { minQuantity: 'ASC' }
    });
  }

  async findAllByVariantId(variantId: number): Promise<ProductTierDiscount[]> {
    return this.productTierDiscountRepository.find({
      where: { productVariantId: variantId },
      order: { minQuantity: 'ASC' }
    });
  }

  async findById(id: number): Promise<ProductTierDiscount | null> {
    return this.productTierDiscountRepository.findOne({
      where: { id }
    });
  }

  async create(dto: ProductTierDiscountCreateDto): Promise<ProductTierDiscount> {
    // Đảm bảo chỉ có một trong hai trường productId hoặc productVariantId
    if (dto.productId && dto.productVariantId) {
      throw new Error('Không thể đồng thời cung cấp cả productId và productVariantId');
    }
    
    if (!dto.productId && !dto.productVariantId) {
      throw new Error('Phải cung cấp productId hoặc productVariantId');
    }

    const tierDiscount = this.productTierDiscountRepository.create(dto);
    return this.productTierDiscountRepository.save(tierDiscount);
  }

  async update(id: number, dto: ProductTierDiscountUpdateDto): Promise<ProductTierDiscount> {
    // Kiểm tra xem có đang cố gắng thay đổi từ product sang variant hoặc ngược lại không
    if (dto.productId !== undefined && dto.productVariantId !== undefined) {
      throw new Error('Không thể đồng thời cung cấp cả productId và productVariantId');
    }

    await this.productTierDiscountRepository.update(id, dto);
    return this.findById(id) as Promise<ProductTierDiscount>;
  }

  async delete(id: number): Promise<void> {
    await this.productTierDiscountRepository.delete(id);
  }

  async deleteAllByProductId(productId: number): Promise<void> {
    await this.productTierDiscountRepository.delete({ productId });
  }

  async deleteAllByVariantId(variantId: number): Promise<void> {
    await this.productTierDiscountRepository.delete({ productVariantId: variantId });
  }
} 