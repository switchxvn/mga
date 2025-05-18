import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductTierDiscount } from '../../entities/product-tier-discount.entity';

@Injectable()
export class FrontendProductTierDiscountService {
  constructor(
    @InjectRepository(ProductTierDiscount)
    private readonly productTierDiscountRepository: Repository<ProductTierDiscount>
  ) {}

  async findAllByProductId(productId: number): Promise<ProductTierDiscount[]> {
    return this.productTierDiscountRepository.find({
      where: { 
        productId,
        isActive: true
      },
      order: { minQuantity: 'ASC' }
    });
  }

  async findAllByVariantId(variantId: number): Promise<ProductTierDiscount[]> {
    return this.productTierDiscountRepository.find({
      where: { 
        productVariantId: variantId,
        isActive: true
      },
      order: { minQuantity: 'ASC' }
    });
  }

  async getDiscountPercentForQuantity(productId: number | null, variantId: number | null, quantity: number): Promise<number> {
    if (!productId && !variantId) {
      return 0;
    }

    let query = this.productTierDiscountRepository.createQueryBuilder('discount')
      .where('discount.is_active = :isActive', { isActive: true })
      .andWhere('discount.min_quantity <= :quantity', { quantity })
      .orderBy('discount.min_quantity', 'DESC')
      .take(1);

    if (productId) {
      query = query.andWhere('discount.product_id = :productId', { productId });
    } else if (variantId) {
      query = query.andWhere('discount.product_variant_id = :variantId', { variantId });
    }

    const tierDiscount = await query.getOne();
    
    return tierDiscount ? parseFloat(tierDiscount.discountPercent.toString()) : 0;
  }
} 