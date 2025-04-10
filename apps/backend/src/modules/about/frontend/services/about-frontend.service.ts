import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AboutSection } from '../../entities/about-section.entity';
import { AboutSectionTranslation } from '../../entities/about-section-translation.entity';

@Injectable()
export class AboutFrontendService {
  constructor(
    @InjectRepository(AboutSection)
    private readonly sectionRepository: Repository<AboutSection>,
    @InjectRepository(AboutSectionTranslation)
    private readonly sectionTranslationRepository: Repository<AboutSectionTranslation>
  ) {}

  async getActiveSections(locale: string): Promise<AboutSection[]> {
    return this.sectionRepository.find({
      where: {
        is_active: true
      },
      relations: {
        translations: true
      },
      order: {
        order: 'ASC'
      }
    });
  }

  async getSectionById(id: number, locale: string): Promise<AboutSection | null> {
    return this.sectionRepository.findOne({
      where: {
        id,
        is_active: true
      },
      relations: {
        translations: true
      }
    });
  }
} 