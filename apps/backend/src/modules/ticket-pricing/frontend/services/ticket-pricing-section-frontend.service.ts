import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketPricingSection } from '../../entities/ticket-pricing-section.entity';
import { TicketPricingSectionTranslation } from '../../entities/ticket-pricing-section-translation.entity';

@Injectable()
export class TicketPricingSectionFrontendService {
  constructor(
    @InjectRepository(TicketPricingSection)
    private readonly sectionRepository: Repository<TicketPricingSection>,
    @InjectRepository(TicketPricingSectionTranslation)
    private readonly translationRepository: Repository<TicketPricingSectionTranslation>,
  ) {}

  async getActiveSections(locale: string) {
    const sections = await this.sectionRepository.find({
      where: { isActive: true },
      relations: ['translations'],
      order: { order: 'ASC' },
    });

    // Lọc translations theo locale
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

    // Lọc translations theo locale
    return {
      ...section,
      translations: section.translations.filter(t => t.locale === locale),
    };
  }
} 