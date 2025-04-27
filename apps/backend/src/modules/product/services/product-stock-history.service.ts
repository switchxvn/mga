import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductStockHistory, StockAdjustmentType } from '../entities/product-stock-history.entity';
import { Product } from '../entities/product.entity';
import { ProductVariant } from '../entities/product-variant.entity';

@Injectable()
export class ProductStockHistoryService {
  constructor(
    @InjectRepository(ProductStockHistory)
    private readonly stockHistoryRepository: Repository<ProductStockHistory>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
  ) {}

  /**
   * Ghi lại lịch sử thay đổi tồn kho của sản phẩm
   */
  async recordStockAdjustment(
    params: {
      productId?: number;
      variantId?: number;
      adjustmentType: StockAdjustmentType;
      adjustmentQuantity: number;
      referenceId?: number;
      referenceType?: string;
      note?: string;
      userId?: number;
    },
  ): Promise<ProductStockHistory> {
    // Kiểm tra có ít nhất productId hoặc variantId
    if (!params.productId && !params.variantId) {
      throw new Error('Phải chỉ định productId hoặc variantId');
    }

    let quantityBefore = 0;
    let quantityAfter = 0;

    // Lấy số lượng hiện tại trước khi điều chỉnh
    if (params.productId && !params.variantId) {
      // Trường hợp điều chỉnh sản phẩm chính
      const product = await this.productRepository.findOne({
        where: { id: params.productId },
      });
      if (!product) {
        throw new Error(`Không tìm thấy sản phẩm với ID: ${params.productId}`);
      }
      quantityBefore = product.quantity || 0;
      quantityAfter = quantityBefore + params.adjustmentQuantity;

      // Cập nhật số lượng mới cho sản phẩm
      await this.productRepository.update(params.productId, {
        quantity: quantityAfter,
      });
    } else if (params.variantId) {
      // Trường hợp điều chỉnh biến thể sản phẩm
      const variant = await this.variantRepository.findOne({
        where: { id: params.variantId },
      });
      if (!variant) {
        throw new Error(`Không tìm thấy biến thể với ID: ${params.variantId}`);
      }
      quantityBefore = variant.quantity || 0;
      quantityAfter = quantityBefore + params.adjustmentQuantity;

      // Cập nhật số lượng mới cho biến thể
      await this.variantRepository.update(params.variantId, {
        quantity: quantityAfter,
      });
    }

    // Ghi lại lịch sử điều chỉnh
    const stockHistory = this.stockHistoryRepository.create({
      productId: params.productId || null,
      variantId: params.variantId || null,
      adjustmentType: params.adjustmentType,
      quantityBefore,
      adjustmentQuantity: params.adjustmentQuantity,
      quantityAfter,
      referenceId: params.referenceId || null,
      referenceType: params.referenceType || null,
      note: params.note || null,
      userId: params.userId || null,
    });

    return this.stockHistoryRepository.save(stockHistory);
  }

  /**
   * Lấy lịch sử điều chỉnh tồn kho của sản phẩm
   */
  async getProductStockHistory(
    productId: number,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      orderDirection?: 'ASC' | 'DESC';
    },
  ): Promise<{ data: ProductStockHistory[]; total: number }> {
    const { limit = 10, offset = 0, orderBy = 'createdAt', orderDirection = 'DESC' } = options || {};

    const [data, total] = await this.stockHistoryRepository.findAndCount({
      where: { productId },
      order: { [orderBy]: orderDirection },
      take: limit,
      skip: offset,
      relations: ['product'],
    });

    return { data, total };
  }

  /**
   * Lấy lịch sử điều chỉnh tồn kho của biến thể sản phẩm
   */
  async getVariantStockHistory(
    variantId: number,
    options?: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      orderDirection?: 'ASC' | 'DESC';
    },
  ): Promise<{ data: ProductStockHistory[]; total: number }> {
    const { limit = 10, offset = 0, orderBy = 'createdAt', orderDirection = 'DESC' } = options || {};

    const [data, total] = await this.stockHistoryRepository.findAndCount({
      where: { variantId },
      order: { [orderBy]: orderDirection },
      take: limit,
      skip: offset,
      relations: ['variant', 'variant.product'],
    });

    return { data, total };
  }

  /**
   * Ghi lại điều chỉnh số lượng thủ công (bởi admin)
   */
  async recordAdminAdjustment(
    params: {
      productId?: number;
      variantId?: number;
      adjustmentQuantity: number;
      note?: string;
      userId?: number;
    },
  ): Promise<ProductStockHistory> {
    return this.recordStockAdjustment({
      ...params,
      adjustmentType: StockAdjustmentType.ADMIN_ADJUSTMENT,
    });
  }

  /**
   * Ghi lại thay đổi do đơn hàng khách hàng
   */
  async recordCustomerOrder(
    params: {
      productId?: number;
      variantId?: number;
      adjustmentQuantity: number; // Luôn là số âm vì lấy hàng ra khỏi kho
      orderId: number;
      userId?: number;
    },
  ): Promise<ProductStockHistory> {
    return this.recordStockAdjustment({
      ...params,
      adjustmentType: StockAdjustmentType.CUSTOMER_ORDER,
      referenceId: params.orderId,
      referenceType: 'order',
    });
  }

  /**
   * Ghi lại thay đổi do hoàn trả hàng
   */
  async recordRefund(
    params: {
      productId?: number;
      variantId?: number;
      adjustmentQuantity: number; // Luôn là số dương vì trả hàng vào kho
      orderId: number;
      note?: string;
      userId?: number;
    },
  ): Promise<ProductStockHistory> {
    return this.recordStockAdjustment({
      ...params,
      adjustmentType: StockAdjustmentType.REFUND,
      referenceId: params.orderId,
      referenceType: 'order',
    });
  }

  /**
   * Ghi lại thay đổi do kiểm kê kho
   */
  async recordInventoryCheck(
    params: {
      productId?: number;
      variantId?: number;
      adjustmentQuantity: number;
      note?: string;
      userId?: number;
      checkId?: number;
    },
  ): Promise<ProductStockHistory> {
    return this.recordStockAdjustment({
      ...params,
      adjustmentType: StockAdjustmentType.INVENTORY_CHECK,
      referenceId: params.checkId,
      referenceType: 'inventory_check',
    });
  }
} 