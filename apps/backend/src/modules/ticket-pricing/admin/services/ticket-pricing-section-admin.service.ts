import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketPricingSection } from '../../entities/ticket-pricing-section.entity';
import { TicketPricingSectionTranslation } from '../../entities/ticket-pricing-section-translation.entity';

@Injectable()
export class TicketPricingSectionAdminService {
  constructor(
    @InjectRepository(TicketPricingSection)
    private readonly sectionRepository: Repository<TicketPricingSection>,
    @InjectRepository(TicketPricingSectionTranslation)
    private readonly translationRepository: Repository<TicketPricingSectionTranslation>,
  ) {}

  async findAllSections() {
    return this.sectionRepository.find({
      relations: ['translations'],
      order: { order: 'ASC' },
    });
  }

  async findSectionById(id: number) {
    return this.sectionRepository.findOne({
      where: { id },
      relations: ['translations'],
    });
  }

  async createSection(data: any) {
    const { translations, ...sectionData } = data;
    
    const section = this.sectionRepository.create(sectionData);
    const savedSection = await this.sectionRepository.save(section);
    
    // Đảm bảo savedSection là một đối tượng đơn lẻ, không phải mảng
    const sectionId = Array.isArray(savedSection) 
      ? (savedSection as TicketPricingSection[])[0].id 
      : (savedSection as TicketPricingSection).id;

    if (translations && translations.length > 0) {
      const translationEntities = translations.map(translation => 
        this.translationRepository.create({
          ...translation,
          sectionId: sectionId,
        })
      );
      await this.translationRepository.save(translationEntities);
    }

    return this.findSectionById(sectionId);
  }

  async updateSection(id: number, data: any) {
    const { translations, ...sectionData } = data;
    
    await this.sectionRepository.update(id, sectionData);

    if (translations && translations.length > 0) {
      // Xóa các translations cũ
      await this.translationRepository.delete({ sectionId: id });
      
      // Tạo translations mới
      const translationEntities = translations.map(translation => 
        this.translationRepository.create({
          ...translation,
          sectionId: id,
        })
      );
      await this.translationRepository.save(translationEntities);
    }

    return this.findSectionById(id);
  }

  async deleteSection(id: number) {
    return this.sectionRepository.delete(id);
  }

  async updateSectionsOrder(orderData: { id: number; order: number }[]) {
    const updatePromises = orderData.map(({ id, order }) => 
      this.sectionRepository.update(id, { order })
    );
    
    await Promise.all(updatePromises);
    
    return this.findAllSections();
  }
} 