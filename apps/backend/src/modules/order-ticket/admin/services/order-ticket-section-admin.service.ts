import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderTicketSection } from '../../entities/order-ticket-section.entity';
import { OrderTicketSectionTranslation } from '../../entities/order-ticket-section-translation.entity';

@Injectable()
export class OrderTicketSectionAdminService {
  constructor(
    @InjectRepository(OrderTicketSection)
    private readonly sectionRepository: Repository<OrderTicketSection>,
    @InjectRepository(OrderTicketSectionTranslation)
    private readonly translationRepository: Repository<OrderTicketSectionTranslation>,
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
    
    const sectionId = Array.isArray(savedSection) 
      ? (savedSection as OrderTicketSection[])[0].id 
      : (savedSection as OrderTicketSection).id;

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
      await this.translationRepository.delete({ sectionId: id });
      
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