import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactSection } from '../../entities/contact-section.entity';
import { ContactSectionTranslation } from '../../entities/contact-section-translation.entity';

@Injectable()
export class ContactSectionFrontendService {
  constructor(
    @InjectRepository(ContactSection)
    private readonly contactSectionRepository: Repository<ContactSection>,
    @InjectRepository(ContactSectionTranslation)
    private readonly contactSectionTranslationRepository: Repository<ContactSectionTranslation>,
  ) {}

  async getActiveSections(locale: string) {
    return this.contactSectionRepository
      .createQueryBuilder('section')
      .leftJoinAndSelect('section.translations', 'translation', 'translation.locale = :locale', { locale })
      .where('section.isActive = :isActive', { isActive: true })
      .orderBy('section.order', 'ASC')
      .getMany();
  }

  async getSectionById(id: number, locale: string) {
    return this.contactSectionRepository
      .createQueryBuilder('section')
      .leftJoinAndSelect('section.translations', 'translation', 'translation.locale = :locale', { locale })
      .where('section.id = :id', { id })
      .getOne();
  }
} 