import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ThemeSection } from '../../entities/theme-section.entity';
import { Theme } from '../../entities/theme.entity';
import { PageType } from '@ew/shared';

@Injectable()
export class ThemeSectionAdminService {
  constructor(
    @InjectRepository(ThemeSection)
    private readonly themeSectionRepository: Repository<ThemeSection>,
    @InjectRepository(Theme)
    private readonly themeRepository: Repository<Theme>
  ) {}

  // Obține toate secțiunile unui theme
  async getAllByThemeId(themeId: number): Promise<ThemeSection[]> {
    const theme = await this.themeRepository.findOne({
      where: { id: themeId },
      relations: ['sections'],
      order: {
        sections: {
          order: 'ASC'
        }
      }
    });

    if (!theme) {
      throw new NotFoundException(`Theme with ID ${themeId} not found`);
    }

    return theme.sections;
  }

  // Obține o secțiune specifică
  async getById(themeId: number, sectionId: number): Promise<ThemeSection> {
    const section = await this.themeSectionRepository.findOne({
      where: {
        id: sectionId,
        theme: { id: themeId }
      }
    });

    if (!section) {
      throw new NotFoundException(`Section with ID ${sectionId} not found in theme ${themeId}`);
    }

    return section;
  }

  // Creează o nouă secțiune
  async create(themeId: number, data: {
    title: string;
    type: string;
    componentName?: string;
    pageType: PageType;
    order: number;
    isActive?: boolean;
    settings?: Record<string, any>;
  }): Promise<ThemeSection> {
    const theme = await this.themeRepository.findOne({
      where: { id: themeId }
    });

    if (!theme) {
      throw new NotFoundException(`Theme with ID ${themeId} not found`);
    }

    const newSection = this.themeSectionRepository.create({
      ...data,
      isActive: data.isActive ?? true,
      theme
    });

    return this.themeSectionRepository.save(newSection);
  }

  // Actualizează o secțiune existentă
  async update(themeId: number, sectionId: number, data: Partial<ThemeSection>): Promise<ThemeSection> {
    const section = await this.getById(themeId, sectionId);
    
    // Update doar câmpurile furnizate
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        section[key] = data[key];
      }
    });

    return this.themeSectionRepository.save(section);
  }

  // Actualizează ordinea unei secțiuni
  async updateOrder(sectionId: number, order: number): Promise<ThemeSection> {
    const section = await this.themeSectionRepository.findOne({
      where: { id: sectionId }
    });

    if (!section) {
      throw new NotFoundException(`Section with ID ${sectionId} not found`);
    }

    section.order = order;
    return this.themeSectionRepository.save(section);
  }

  // Șterge o secțiune
  async delete(themeId: number, sectionId: number): Promise<void> {
    const section = await this.getById(themeId, sectionId);
    await this.themeSectionRepository.remove(section);
  }
} 