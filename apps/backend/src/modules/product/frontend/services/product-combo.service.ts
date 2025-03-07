import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCombo } from '../../entities/product-combo.entity';
import { Product } from '../../entities/product.entity';
import { ProductFrontendService } from './product-frontend.service';

@Injectable()
export class ProductComboService {
  constructor(
    @InjectRepository(ProductCombo)
    private productComboRepository: Repository<ProductCombo>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private productFrontendService: ProductFrontendService,
  ) {}

  /**
   * Lấy danh sách sản phẩm combo cho một sản phẩm
   */
  async getProductCombos(productId: number, locale: string = 'en', limit: number = 4): Promise<any[]> {
    const productCombos = await this.productComboRepository.find({
      where: { mainProductId: productId, active: true },
      relations: ['comboProduct', 'comboProduct.translations'],
      order: { position: 'ASC' },
      take: limit,
    });

    // Lọc các sản phẩm đã xuất bản
    const combos = productCombos
      .filter(combo => combo.comboProduct.published);

    // Thêm thông tin dịch cho sản phẩm và tính giá combo
    return combos.map(combo => {
      const product = combo.comboProduct;
      const translation = this.productFrontendService.getTranslation(product, locale);
      
      // Tính giá sau khi giảm
      let discountedPrice = product.price;
      if (product.price !== null) {
        if (combo.discountAmount !== null) {
          discountedPrice = Math.max(0, product.price - combo.discountAmount);
        } else if (combo.discountPercent !== null) {
          discountedPrice = product.price * (1 - combo.discountPercent / 100);
        }
      }
      
      return {
        id: combo.id,
        comboId: combo.id,
        productId: product.id,
        title: translation?.title || '',
        shortDescription: translation?.shortDescription || '',
        thumbnail: product.thumbnail || '',
        price: product.price,
        discountAmount: combo.discountAmount,
        discountPercent: combo.discountPercent,
        discountedPrice,
        formattedPrice: this.productFrontendService.formatPrice(product.price),
        formattedDiscountedPrice: this.productFrontendService.formatPrice(discountedPrice),
      };
    });
  }

  /**
   * Thêm sản phẩm combo
   */
  async addProductCombo(
    mainProductId: number, 
    comboProductId: number, 
    discountAmount: number | null = null, 
    discountPercent: number | null = null, 
    position: number = 0
  ): Promise<ProductCombo> {
    // Kiểm tra sản phẩm tồn tại
    const mainProduct = await this.productRepository.findOne({ where: { id: mainProductId } });
    const comboProduct = await this.productRepository.findOne({ where: { id: comboProductId } });

    if (!mainProduct || !comboProduct) {
      throw new Error('Product not found');
    }

    // Kiểm tra xem đã tồn tại combo này chưa
    const existing = await this.productComboRepository.findOne({
      where: { mainProductId, comboProductId }
    });

    if (existing) {
      // Cập nhật nếu đã tồn tại
      existing.discountAmount = discountAmount;
      existing.discountPercent = discountPercent;
      existing.position = position;
      existing.active = true;
      return this.productComboRepository.save(existing);
    }

    // Tạo mới nếu chưa tồn tại
    const productCombo = this.productComboRepository.create({
      mainProductId,
      comboProductId,
      discountAmount,
      discountPercent,
      position,
      active: true
    });

    return this.productComboRepository.save(productCombo);
  }

  /**
   * Xóa sản phẩm combo
   */
  async removeProductCombo(mainProductId: number, comboProductId: number): Promise<void> {
    await this.productComboRepository.delete({
      mainProductId,
      comboProductId
    });
  }

  /**
   * Cập nhật trạng thái active của sản phẩm combo
   */
  async updateProductComboStatus(id: number, active: boolean): Promise<ProductCombo> {
    const productCombo = await this.productComboRepository.findOne({ where: { id } });
    
    if (!productCombo) {
      throw new Error('Product combo not found');
    }

    productCombo.active = active;
    return this.productComboRepository.save(productCombo);
  }

  /**
   * Cập nhật vị trí của sản phẩm combo
   */
  async updateProductComboPosition(id: number, position: number): Promise<ProductCombo> {
    const productCombo = await this.productComboRepository.findOne({ where: { id } });
    
    if (!productCombo) {
      throw new Error('Product combo not found');
    }

    productCombo.position = position;
    return this.productComboRepository.save(productCombo);
  }

  /**
   * Cập nhật giảm giá của sản phẩm combo
   */
  async updateProductComboDiscount(
    id: number, 
    discountAmount: number | null, 
    discountPercent: number | null
  ): Promise<ProductCombo> {
    const productCombo = await this.productComboRepository.findOne({ where: { id } });
    
    if (!productCombo) {
      throw new Error('Product combo not found');
    }

    productCombo.discountAmount = discountAmount;
    productCombo.discountPercent = discountPercent;
    return this.productComboRepository.save(productCombo);
  }

  /**
   * Lấy tất cả sản phẩm combo của một sản phẩm (cho admin)
   */
  async getAllProductCombos(mainProductId: number): Promise<ProductCombo[]> {
    return this.productComboRepository.find({
      where: { mainProductId },
      relations: ['comboProduct', 'comboProduct.translations'],
      order: { position: 'ASC' },
    });
  }
} 