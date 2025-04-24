import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactSection } from '../../entities/contact-section.entity';
import { ContactSectionTranslation } from '../../entities/contact-section-translation.entity';
import { ContactSectionType } from '../../entities/contact-section.entity';

@Injectable()
export class ContactSectionAdminService {
  constructor(
    @InjectRepository(ContactSection)
    private readonly contactSectionRepository: Repository<ContactSection>,
    @InjectRepository(ContactSectionTranslation)
    private readonly contactSectionTranslationRepository: Repository<ContactSectionTranslation>,
  ) {}

  async findAllSections() {
    return this.contactSectionRepository.find({
      relations: ['translations'],
      order: {
        order: 'ASC',
      },
    });
  }

  async findSectionById(id: number) {
    return this.contactSectionRepository.findOne({
      where: { id },
      relations: ['translations'],
    });
  }

  async createSection(data: {
    type: ContactSectionType;
    component_name: string;
    order?: number;
    settings?: Record<string, any>;
    is_active?: boolean;
    translations?: Array<{
      locale: string;
      title: string;
      subtitle?: string;
      content?: string;
      data?: Record<string, any>;
    }>;
  }) {
    const { translations, ...sectionData } = data;
    
    const section = this.contactSectionRepository.create(sectionData);
    await this.contactSectionRepository.save(section);

    if (translations && translations.length > 0) {
      const translationEntities = translations.map(translation => 
        this.contactSectionTranslationRepository.create({
          ...translation,
          section,
        })
      );
      await this.contactSectionTranslationRepository.save(translationEntities);
    }

    return this.findSectionById(section.id);
  }

  async updateSection(id: number, data: {
    type?: ContactSectionType;
    component_name?: string;
    order?: number;
    settings?: Record<string, any>;
    is_active?: boolean;
    translations?: Array<{
      locale: string;
      title: string;
      subtitle?: string;
      content?: string;
      data?: Record<string, any>;
    }>;
  }) {
    const { translations, ...sectionData } = data;
    
    const section = await this.findSectionById(id);
    if (!section) {
      throw new Error('Section not found');
    }

    // Update section
    await this.contactSectionRepository.update(id, sectionData);

    // Update translations if provided
    if (translations) {
      // Delete existing translations
      await this.contactSectionTranslationRepository.delete({ section: { id } });

      // Create new translations
      const translationEntities = translations.map(translation => 
        this.contactSectionTranslationRepository.create({
          ...translation,
          section,
        })
      );
      await this.contactSectionTranslationRepository.save(translationEntities);
    }

    return this.findSectionById(id);
  }

  async deleteSection(id: number) {
    const section = await this.findSectionById(id);
    if (!section) {
      throw new Error('Section not found');
    }

    // Delete translations first
    await this.contactSectionTranslationRepository.delete({ section: { id } });
    
    // Then delete section
    await this.contactSectionRepository.delete(id);
    
    return section;
  }

  async updateSectionsOrder(sections: Array<{ id: number; order: number }>) {
    // Use transaction to ensure all updates succeed or none do
    return this.contactSectionRepository.manager.transaction(async (transactionalEntityManager) => {
      const updates = sections.map(({ id, order }) =>
        transactionalEntityManager.update(ContactSection, id, { order })
      );
      await Promise.all(updates);
    });
  }
} 