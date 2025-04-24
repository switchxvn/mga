import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductType } from '../../../../apps/backend/src/modules/product/entities/product.entity';
import { ProductTranslation } from '../../../../apps/backend/src/modules/product/entities/product-translation.entity';
import { ProductVariant } from '../../../../apps/backend/src/modules/product/entities/product-variant.entity';
import { ProductVariantTranslation } from '../../../../apps/backend/src/modules/product/entities/product-variant-translation.entity';
import { ProductAttribute } from '../../../../apps/backend/src/modules/product/entities/product-attribute.entity';
import { ProductAttributeTranslation } from '../../../../apps/backend/src/modules/product/entities/product-attribute-translation.entity';
import { ProductAttributeValue } from '../../../../apps/backend/src/modules/product/entities/product-attribute-value.entity';
import { ProductAttributeValueTranslation } from '../../../../apps/backend/src/modules/product/entities/product-attribute-value-translation.entity';

@Injectable()
export class TicketProductSeeder {
  private readonly logger = new Logger(TicketProductSeeder.name);

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductTranslation)
    private productTranslationRepository: Repository<ProductTranslation>,
    @InjectRepository(ProductVariant)
    private productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductVariantTranslation)
    private productVariantTranslationRepository: Repository<ProductVariantTranslation>,
    @InjectRepository(ProductAttribute)
    private productAttributeRepository: Repository<ProductAttribute>,
    @InjectRepository(ProductAttributeTranslation)
    private productAttributeTranslationRepository: Repository<ProductAttributeTranslation>,
    @InjectRepository(ProductAttributeValue)
    private productAttributeValueRepository: Repository<ProductAttributeValue>,
    @InjectRepository(ProductAttributeValueTranslation)
    private productAttributeValueTranslationRepository: Repository<ProductAttributeValueTranslation>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting ticket product seeding...');
    
    // Kiểm tra xem đã có sản phẩm ticket chưa
    const existingProduct = await this.productRepository.findOne({
      where: { sku: 'TICKET001' }
    });

    if (existingProduct) {
      this.logger.log('Ticket product already exists, skipping seed');
      return;
    }

    try {
      // 1. Tạo thuộc tính "Loại vé"
      this.logger.log('Creating ticket type attribute...');
      const ticketTypeAttribute = await this.createAttribute('ticket_type', 'Loại vé', 'Ticket Type');
      this.logger.log(`Created ticket type attribute with ID: ${ticketTypeAttribute.id}`);
      
      // 2. Tạo giá trị thuộc tính "Người lớn" và "Trẻ em"
      this.logger.log('Creating attribute values...');
      const adultValue = await this.createAttributeValue(ticketTypeAttribute.id, 'adult', 'Người lớn', 'Adult');
      this.logger.log(`Created adult value with ID: ${adultValue.id}`);
      
      const childValue = await this.createAttributeValue(ticketTypeAttribute.id, 'child', 'Trẻ em', 'Child');
      this.logger.log(`Created child value with ID: ${childValue.id}`);

      // 3. Tạo thuộc tính "Buffet"
      this.logger.log('Creating buffet attribute...');
      const buffetAttribute = await this.createAttribute('buffet', 'Buffet', 'Buffet');
      this.logger.log(`Created buffet attribute with ID: ${buffetAttribute.id}`);
      
      // 4. Tạo giá trị thuộc tính "Có buffet" và "Không buffet"
      this.logger.log('Creating buffet attribute values...');
      const withBuffetValue = await this.createAttributeValue(buffetAttribute.id, 'with_buffet', 'Có buffet', 'With Buffet');
      this.logger.log(`Created with buffet value with ID: ${withBuffetValue.id}`);
      
      const withoutBuffetValue = await this.createAttributeValue(buffetAttribute.id, 'without_buffet', 'Không buffet', 'Without Buffet');
      this.logger.log(`Created without buffet value with ID: ${withoutBuffetValue.id}`);

      // 5. Tạo sản phẩm ticket
      this.logger.log('Creating ticket product...');
      const ticketProduct = this.productRepository.create({
        sku: 'TICKET001',
        price: null, // Giá sẽ được đặt ở variant
        published: true,
        quantity: 0, // Số lượng sẽ được tính từ các variant
        isFeatured: true,
        isNew: true,
        type: ProductType.TICKET,
        thumbnail: '/images/products/ticket.jpg',
        gallery: ['/images/products/ticket-1.jpg', '/images/products/ticket-2.jpg'],
      });

      const savedProduct = await this.productRepository.save(ticketProduct);
      this.logger.log(`Created ticket product with ID: ${savedProduct.id}`);

      // 6. Tạo bản dịch cho sản phẩm
      this.logger.log('Creating product translations...');
      await this.createProductTranslation(savedProduct.id, 'vi', 'Vé tham quan', 'Vé tham quan với nhiều lựa chọn cho người lớn và trẻ em', 'Vé tham quan với giá ưu đãi cho người lớn và trẻ em');
      await this.createProductTranslation(savedProduct.id, 'en', 'Tour Ticket', 'Tour ticket with options for adults and children', 'Tour ticket with special pricing for adults and children');
      this.logger.log('Created product translations');

      // 7. Tạo variant cho người lớn có buffet
      this.logger.log('Creating adult with buffet variant...');
      const adultWithBuffetVariant = await this.createVariant(
        savedProduct.id, 
        'TICKET001-ADULT-WITH-BUFFET', 
        250000, 
        'Người lớn có buffet', 
        'Adult with Buffet',
        [adultValue.id, withBuffetValue.id]
      );
      this.logger.log(`Created adult with buffet variant with ID: ${adultWithBuffetVariant.id}`);

      // 8. Tạo variant cho người lớn không có buffet
      this.logger.log('Creating adult without buffet variant...');
      const adultWithoutBuffetVariant = await this.createVariant(
        savedProduct.id, 
        'TICKET001-ADULT-WITHOUT-BUFFET', 
        150000, 
        'Người lớn không buffet', 
        'Adult without Buffet',
        [adultValue.id, withoutBuffetValue.id]
      );
      this.logger.log(`Created adult without buffet variant with ID: ${adultWithoutBuffetVariant.id}`);

      // 9. Tạo variant cho trẻ em có buffet
      this.logger.log('Creating child with buffet variant...');
      const childWithBuffetVariant = await this.createVariant(
        savedProduct.id, 
        'TICKET001-CHILD-WITH-BUFFET', 
        120000, 
        'Trẻ em có buffet', 
        'Child with Buffet',
        [childValue.id, withBuffetValue.id]
      );
      this.logger.log(`Created child with buffet variant with ID: ${childWithBuffetVariant.id}`);

      // 10. Tạo variant cho trẻ em không có buffet
      this.logger.log('Creating child without buffet variant...');
      const childWithoutBuffetVariant = await this.createVariant(
        savedProduct.id, 
        'TICKET001-CHILD-WITHOUT-BUFFET', 
        70000, 
        'Trẻ em không buffet', 
        'Child without Buffet',
        [childValue.id, withoutBuffetValue.id]
      );
      this.logger.log(`Created child without buffet variant with ID: ${childWithoutBuffetVariant.id}`);

      this.logger.log('Ticket product seeded successfully');
    } catch (error) {
      this.logger.error(`Error seeding ticket product: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }

  private async createAttribute(code: string, nameVi: string, nameEn: string): Promise<ProductAttribute> {
    const attribute = this.productAttributeRepository.create({
      code,
      published: true,
      position: 0,
    });

    const savedAttribute = await this.productAttributeRepository.save(attribute);

    // Tạo bản dịch cho thuộc tính
    await this.productAttributeTranslationRepository.save([
      {
        attributeId: savedAttribute.id,
        locale: 'vi',
        name: nameVi,
      },
      {
        attributeId: savedAttribute.id,
        locale: 'en',
        name: nameEn,
      },
    ]);

    return savedAttribute;
  }

  private async createAttributeValue(
    attributeId: number, 
    code: string, 
    nameVi: string, 
    nameEn: string
  ): Promise<ProductAttributeValue> {
    const value = this.productAttributeValueRepository.create({
      attributeId,
      code,
      published: true,
      position: 0,
    });

    const savedValue = await this.productAttributeValueRepository.save(value);

    // Tạo bản dịch cho giá trị thuộc tính
    await this.productAttributeValueTranslationRepository.save([
      {
        valueId: savedValue.id,
        locale: 'vi',
        name: nameVi,
      },
      {
        valueId: savedValue.id,
        locale: 'en',
        name: nameEn,
      },
    ]);

    return savedValue;
  }

  private async createProductTranslation(
    productId: number, 
    locale: string, 
    title: string, 
    content: string, 
    shortDescription: string
  ): Promise<ProductTranslation> {
    const translation = this.productTranslationRepository.create({
      productId,
      locale,
      title,
      content,
      shortDescription,
      slug: `${locale === 'vi' ? 've-tham-quan' : 'tour-ticket'}`,
    });

    return await this.productTranslationRepository.save(translation);
  }

  private async createVariant(
    productId: number, 
    sku: string, 
    price: number, 
    nameVi: string, 
    nameEn: string,
    attributeValueIds: number[]
  ): Promise<ProductVariant> {
    const variant = this.productVariantRepository.create({
      productId,
      sku,
      price,
      published: true,
      quantity: 100,
    });

    const savedVariant = await this.productVariantRepository.save(variant);

    // Tạo bản dịch cho variant
    await this.productVariantTranslationRepository.save([
      {
        variantId: savedVariant.id,
        locale: 'vi',
        name: nameVi,
      },
      {
        variantId: savedVariant.id,
        locale: 'en',
        name: nameEn,
      },
    ]);

    // Liên kết variant với các giá trị thuộc tính
    await this.productVariantRepository
      .createQueryBuilder()
      .relation(ProductVariant, 'attributeValues')
      .of(savedVariant)
      .add(attributeValueIds);

    return savedVariant;
  }
} 