import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductSpecification } from '../entities/product-specification.entity';
import { ProductSpecificationTranslation } from '../entities/product-specification-translation.entity';

@Injectable()
export class ProductSpecificationService {
  constructor(
    @InjectRepository(ProductSpecification)
    private specificationRepository: Repository<ProductSpecification>,
    @InjectRepository(ProductSpecificationTranslation)
    private specificationTranslationRepository: Repository<ProductSpecificationTranslation>,
  ) {}

  async findByProductId(productId: number, locale: string = 'en'): Promise<any[]> {
    const specifications = await this.specificationRepository.find({
      where: { productId },
      order: { position: 'ASC' },
      relations: ['translations'],
    });

    return specifications.map(spec => {
      const translation = this.getTranslation(spec, locale);
      return {
        id: spec.id,
        name: translation?.name || '',
        value: translation?.value || '',
        position: spec.position,
      };
    });
  }

  getTranslation(specification: ProductSpecification, locale: string): ProductSpecificationTranslation | undefined {
    if (!specification.translations || specification.translations.length === 0) {
      return undefined;
    }

    // Tìm bản dịch theo locale
    let translation = specification.translations.find(t => t.locale === locale);

    // Nếu không tìm thấy, sử dụng bản dịch tiếng Anh làm mặc định
    if (!translation && locale !== 'en') {
      translation = specification.translations.find(t => t.locale === 'en');
    }

    // Nếu vẫn không tìm thấy, sử dụng bản dịch đầu tiên
    if (!translation) {
      translation = specification.translations[0];
    }

    return translation;
  }

  async create(productId: number, data: { name: string; value: string; locale: string; position?: number }): Promise<ProductSpecification> {
    // Tạo specification
    const specification = this.specificationRepository.create({
      productId,
      position: data.position || 0,
    });

    const savedSpec = await this.specificationRepository.save(specification);

    // Tạo translation
    const translation = this.specificationTranslationRepository.create({
      specificationId: savedSpec.id,
      locale: data.locale,
      name: data.name,
      value: data.value,
    });

    await this.specificationTranslationRepository.save(translation);

    // Trả về specification với translation
    savedSpec.translations = [translation];
    return savedSpec;
  }

  async update(id: number, data: { name?: string; value?: string; locale?: string; position?: number }): Promise<ProductSpecification> {
    // Cập nhật position nếu có
    if (data.position !== undefined) {
      await this.specificationRepository.update(id, { position: data.position });
    }

    // Cập nhật translation nếu có
    if (data.name || data.value) {
      const locale = data.locale || 'en';
      const translation = await this.specificationTranslationRepository.findOne({
        where: { specificationId: id, locale },
      });

      if (translation) {
        // Cập nhật translation hiện có
        if (data.name) translation.name = data.name;
        if (data.value) translation.value = data.value;
        await this.specificationTranslationRepository.save(translation);
      } else if (data.name) {
        // Tạo translation mới nếu không tìm thấy
        const newTranslation = this.specificationTranslationRepository.create({
          specificationId: id,
          locale,
          name: data.name,
          value: data.value || '',
        });
        await this.specificationTranslationRepository.save(newTranslation);
      }
    }

    // Trả về specification đã cập nhật
    return this.specificationRepository.findOne({
      where: { id },
      relations: ['translations'],
    });
  }

  async delete(id: number): Promise<void> {
    await this.specificationRepository.delete(id);
  }

  async deleteByProductId(productId: number): Promise<void> {
    const specifications = await this.specificationRepository.find({
      where: { productId },
    });

    if (specifications.length > 0) {
      await this.specificationRepository.remove(specifications);
    }
  }
} 