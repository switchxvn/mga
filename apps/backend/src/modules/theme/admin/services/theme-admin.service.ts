import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Theme } from '../../entities/theme.entity';
import { ThemeSection } from '../../entities/theme-section.entity';

@Injectable()
export class ThemeAdminService {
  constructor(
    @InjectRepository(Theme)
    private readonly themeRepository: Repository<Theme>,
    @InjectRepository(ThemeSection)
    private readonly themeSectionRepository: Repository<ThemeSection>
  ) {}

  async findAll(): Promise<Theme[]> {
    return this.themeRepository.find({
      relations: ['sections'],
      order: {
        sections: {
          order: 'ASC'
        }
      }
    });
  }

  async findOne(id: number): Promise<Theme> {
    const theme = await this.themeRepository.findOne({
      where: { id },
      relations: ['sections'],
      order: {
        sections: {
          order: 'ASC'
        }
      }
    });

    if (!theme) {
      throw new NotFoundException(`Theme with ID ${id} not found`);
    }

    return theme;
  }

  async create(data: Partial<Theme>): Promise<Theme> {
    const theme = this.themeRepository.create(data);
    await this.themeRepository.save(theme);

    // Create default sections
    const defaultSections = [
      {
        type: 'hero',
        title: 'Hero Section',
        order: 0,
        settings: {
          height: '600px',
          layout: 'split',
          sliderPosition: 'right',
          videoPosition: 'left',
          sliderWidth: '70%',
          videoWidth: '30%',
          autoplay: true,
          interval: 5000,
          showDots: true,
          showArrows: true
        }
      },
      {
        type: 'featured_products',
        title: 'Sản phẩm nổi bật',
        order: 1,
        settings: {
          layout: 'grid',
          columns: 4,
          showPrice: true,
          showRating: true,
          maxItems: 8
        }
      },
      {
        type: 'new_products',
        title: 'Sản phẩm mới',
        order: 2,
        settings: {
          layout: 'slider',
          itemsPerView: 4,
          autoplay: true,
          interval: 3000,
          showPrice: true,
          showRating: true,
          maxItems: 12
        }
      },
      {
        type: 'categories',
        title: 'Danh mục sản phẩm',
        order: 3,
        settings: {
          layout: 'grid',
          columns: 4,
          showDescription: true,
          maxItems: 8
        }
      }
    ];

    const sections = defaultSections.map(section => 
      this.themeSectionRepository.create({
        ...section,
        themeId: theme.id
      })
    );

    await this.themeSectionRepository.save(sections);
    return this.findOne(theme.id);
  }

  async update(id: number, data: Partial<Theme>): Promise<Theme> {
    const theme = await this.findOne(id);
    Object.assign(theme, data);
    await this.themeRepository.save(theme);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const theme = await this.findOne(id);
    await this.themeRepository.remove(theme);
  }

  async setActiveTheme(id: number): Promise<void> {
    // First, deactivate all themes
    await this.themeRepository.update({}, { isActive: false });
    
    // Then, activate the selected theme
    const theme = await this.findOne(id);
    theme.isActive = true;
    await this.themeRepository.save(theme);
  }
} 