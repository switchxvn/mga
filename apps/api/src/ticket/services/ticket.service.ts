import { HttpStatus, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Product } from '../../../../backend/src/modules/product/entities/product.entity';
import { TicketListResponseDto, TicketResponseDto, TicketVariantDto } from '../dtos/ticket-response.dto';
import { TicketAvailabilityResponseDto } from '../dtos/ticket-availability.dto';
import { Upload } from '../../../../backend/src/modules/upload/entities/upload.entity';
import { ProductTranslation } from '../../../../backend/src/modules/product/entities/product-translation.entity';
import { ProductVariant } from '../../../../backend/src/modules/product/entities/product-variant.entity';
import { ProductVariantTranslation } from '../../../../backend/src/modules/product/entities/product-variant-translation.entity';

// Mở rộng type Product để thêm các property thiếu
interface ExtendedProduct extends Product {
  sale_price?: number;
  valid_from?: Date;
  valid_until?: Date;
  location?: string;
  gallery: string[];
}

@Injectable()
export class TicketService {
  private readonly logger = new Logger(TicketService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getTickets(page = 1, limit = 10): Promise<TicketListResponseDto> {
    try {
      const [products, total] = await this.productRepository.findAndCount({
        where: {
          published: true,
          type: 'TICKET',
        } as FindOptionsWhere<Product>,
        relations: ['translations', 'variants', 'variants.translations'],
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

      const ticketData = products.map(product => this.mapProductToTicketResponse(this.extendProduct(product)));

      return {
        data: ticketData,
        total,
        page,
        pageSize: limit,
      };
    } catch (error) {
      this.logger.error('Error fetching tickets:', error);
      throw error;
    }
  }

  async getTicketById(id: number): Promise<TicketResponseDto> {
    try {
      const product = await this.productRepository.findOne({
        where: {
          id,
          published: true,
          type: 'TICKET',
        } as FindOptionsWhere<Product>,
        relations: ['translations', 'variants', 'variants.translations'],
      });

      if (!product) {
        throw new NotFoundException(`Ticket with ID ${id} not found`);
      }

      return this.mapProductToTicketResponse(this.extendProduct(product));
    } catch (error) {
      this.logger.error(`Error fetching ticket with ID ${id}:`, error);
      throw error;
    }
  }

  async getTicketAvailability(id: number, date: string, variantId?: number): Promise<TicketAvailabilityResponseDto> {
    try {
      const product = await this.productRepository.findOne({
        where: {
          id,
          published: true,
          type: 'TICKET',
        } as FindOptionsWhere<Product>,
        relations: ['variants'],
      });

      if (!product) {
        throw new NotFoundException(`Ticket with ID ${id} not found`);
      }

      // Here you would implement actual availability logic based on bookings/inventory
      // This is a simplified example - in a real system, check against bookings database
      const availableQuantity = product.quantity || 0;
      
      // Check if the requested variant exists if variantId is provided
      if (variantId) {
        const variant = product.variants.find(v => v.id === variantId);
        if (!variant) {
          throw new NotFoundException(`Variant with ID ${variantId} not found for ticket ${id}`);
        }
      }

      return {
        id: product.id,
        availableQuantity,
        date,
        variantId,
        isAvailable: availableQuantity > 0,
        additionalInfo: 'Book soon to secure your spot!',
      };
    } catch (error) {
      this.logger.error(`Error checking availability for ticket ${id}:`, error);
      throw error;
    }
  }

  // Phương thức bổ sung để chuyển đổi Product thành ExtendedProduct
  private extendProduct(product: Product): ExtendedProduct {
    // Tạo ExtendedProduct từ Product
    const extendedProduct: ExtendedProduct = {
      ...product,
      sale_price: product.comparePrice || undefined,
      valid_from: undefined, // Trong thực tế, lấy giá trị từ database
      valid_until: undefined, // Trong thực tế, lấy giá trị từ database
      location: '', // Trong thực tế, lấy giá trị từ metadata hoặc database
      gallery: [], // Trong thực tế, lấy giá trị từ metadata hoặc database
    };

    return extendedProduct;
  }

  private mapProductToTicketResponse(product: ExtendedProduct): TicketResponseDto {
    // Get the default translation (assuming first one is default)
    const defaultTranslation = product.translations?.[0] || {} as ProductTranslation;
    
    // Map variants
    const variants: TicketVariantDto[] = product.variants?.map(variant => {
      const variantTranslation = variant.translations?.[0] || {} as ProductVariantTranslation;
      return {
        id: variant.id,
        name: variantTranslation.name || 'Standard Ticket',
        price: variant.price || 0,
        description: variantTranslation.description || '',
      };
    }) || [];

    // Get primary image for thumbnail
    const thumbnailUrl = product.thumbnail || '';
    
    return {
      id: product.id,
      title: defaultTranslation.title || 'Unnamed Ticket',
      slug: defaultTranslation.slug || `ticket-${product.id}`,
      description: defaultTranslation.content || '',
      thumbnailUrl: thumbnailUrl,
      location: product.location || '',
      availableQuantity: product.quantity || 0,
      price: product.price || 0,
      salePrice: product.sale_price || undefined,
      isAvailable: product.published && (product.quantity === null || product.quantity > 0),
      validFrom: product.valid_from || undefined,
      validUntil: product.valid_until || undefined,
      variants: variants.length > 0 ? variants : undefined,
      images: product.gallery || [],
    };
  }
} 