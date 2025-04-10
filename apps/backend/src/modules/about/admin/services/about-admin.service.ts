import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AboutSection } from '../../entities/about-section.entity';
import { AboutSectionTranslation } from '../../entities/about-section-translation.entity';

@Injectable()
export class AboutAdminService {
  constructor(
    @InjectRepository(AboutSection)
    private readonly sectionRepository: Repository<AboutSection>,
    @InjectRepository(AboutSectionTranslation)
    private readonly sectionTranslationRepository: Repository<AboutSectionTranslation>
  ) {}

  async findAllSections(): Promise<AboutSection[]> {
    return this.sectionRepository.find({
      relations: ['translations'],
      order: { order: 'ASC' }
    });
  }

  async findSectionById(id: number): Promise<AboutSection> {
    const section = await this.sectionRepository.findOne({
      where: { id },
      relations: ['translations']
    });

    if (!section) {
      throw new NotFoundException(`Section with ID ${id} not found`);
    }

    return section;
  }

  async createSection(data: Partial<AboutSection>): Promise<AboutSection> {
    const section = this.sectionRepository.create(data);
    return this.sectionRepository.save(section);
  }

  async updateSection(id: number, data: Partial<AboutSection>): Promise<AboutSection> {
    const section = await this.findSectionById(id);
    Object.assign(section, data);
    return this.sectionRepository.save(section);
  }

  async deleteSection(id: number): Promise<void> {
    const section = await this.findSectionById(id);
    await this.sectionRepository.remove(section);
  }

  async updateSectionsOrder(sections: { id: number; order: number }[]): Promise<void> {
    await Promise.all(
      sections.map(({ id, order }) =>
        this.sectionRepository.update(id, { order })
      )
    );
  }
} 