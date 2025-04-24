import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderTicketSection } from '../../entities/order-ticket-section.entity';
import { OrderTicketSectionTranslation } from '../../entities/order-ticket-section-translation.entity';

@Injectable()
export class OrderTicketSectionFrontendService {
  constructor(
    @InjectRepository(OrderTicketSection)
    private readonly sectionRepository: Repository<OrderTicketSection>,
    @InjectRepository(OrderTicketSectionTranslation)
    private readonly translationRepository: Repository<OrderTicketSectionTranslation>,
  ) {}

  async getActiveSections(locale: string) {
    const sections = await this.sectionRepository.find({
      where: { isActive: true },
      relations: ['translations'],
      order: { order: 'ASC' },
    });

    return sections.map(section => ({
      ...section,
      translations: section.translations.filter(t => t.locale === locale),
    }));
  }

  async getSectionById(id: number, locale: string) {
    const section = await this.sectionRepository.findOne({
      where: { id },
      relations: ['translations'],
    });

    if (!section) {
      return null;
    }

    return {
      ...section,
      translations: section.translations.filter(t => t.locale === locale),
    };
  }
} 