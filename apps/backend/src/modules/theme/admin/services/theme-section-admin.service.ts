import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ThemeSection } from '../../entities/theme-section.entity';
import { Theme } from '../../entities/theme.entity';
import { PageType, ThemeSectionTranslation as IThemeSectionTranslation } from '@ew/shared';
import { ThemeSectionTranslation } from '../../entities/theme-section-translation.entity';

@Injectable()
export class ThemeSectionAdminService {
  constructor(
    @InjectRepository(ThemeSection)
    private readonly themeSectionRepository: Repository<ThemeSection>,
    @InjectRepository(Theme)
    private readonly themeRepository: Repository<Theme>,
    @InjectRepository(ThemeSectionTranslation)
    private readonly themeSectionTranslationRepository: Repository<ThemeSectionTranslation>
  ) {}

  // Obține toate secțiunile unui theme
  async getAllByThemeId(themeId: number): Promise<ThemeSection[]> {
    const theme = await this.themeRepository.findOne({
      where: { id: themeId },
      relations: ['sections', 'sections.translations'],
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
      },
      relations: ['translations']
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
    locale?: string;
    description?: string;
  }): Promise<ThemeSection> {
    const theme = await this.themeRepository.findOne({
      where: { id: themeId }
    });

    if (!theme) {
      throw new NotFoundException(`Theme with ID ${themeId} not found`);
    }

    // Locale mặc định nếu không được cung cấp
    const locale = data.locale || 'en';

    // Tạo section mới
    const newSection = this.themeSectionRepository.create({
      type: data.type,
      componentName: data.componentName,
      pageType: data.pageType,
      order: data.order,
      isActive: data.isActive ?? true,
      theme
    });

    // Lưu section để có ID
    const savedSection = await this.themeSectionRepository.save(newSection);

    // Tạo translation cho section
    const translation = this.themeSectionTranslationRepository.create({
      sectionId: savedSection.id,
      locale,
      title: data.title,
      description: data.description,
      settings: data.settings
    });

    // Lưu translation
    await this.themeSectionTranslationRepository.save(translation);

    // Lấy section với dữ liệu đã cập nhật
    return this.getById(themeId, savedSection.id);
  }

  // Actualizează o secțiune existentă
  async update(themeId: number, sectionId: number, data: {
    title?: string;
    type?: string;
    componentName?: string;
    pageType?: PageType;
    order?: number;
    isActive?: boolean;
    settings?: Record<string, any>;
    locale?: string;
    description?: string;
  }): Promise<ThemeSection> {
    const section = await this.getById(themeId, sectionId);
    const locale = data.locale || 'en';
    
    // Cập nhật các trường cơ bản của section
    if (data.type !== undefined) section.type = data.type;
    if (data.componentName !== undefined) section.componentName = data.componentName;
    if (data.pageType !== undefined) section.pageType = data.pageType;
    if (data.order !== undefined) section.order = data.order;
    if (data.isActive !== undefined) section.isActive = data.isActive;

    // Lưu section
    await this.themeSectionRepository.save(section);

    // Kiểm tra và cập nhật translation
    if (data.title !== undefined || data.settings !== undefined || data.description !== undefined) {
      // Tìm translation theo locale
      let translation = section.translations?.find(t => t.locale === locale);

      if (translation) {
        // Cập nhật translation đã tồn tại
        if (data.title !== undefined) translation.title = data.title;
        if (data.description !== undefined) translation.description = data.description;
        if (data.settings !== undefined) translation.settings = data.settings;
        
        await this.themeSectionTranslationRepository.save(translation);
      } else {
        // Tạo translation mới nếu không tồn tại
        translation = this.themeSectionTranslationRepository.create({
          sectionId: section.id,
          locale,
          title: data.title || '',
          description: data.description,
          settings: data.settings
        });
        
        await this.themeSectionTranslationRepository.save(translation);
      }
    }

    // Lấy section với dữ liệu đã cập nhật
    return this.getById(themeId, sectionId);
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

  // Lấy translation của section theo locale
  async getTranslation(sectionId: number, locale: string): Promise<ThemeSectionTranslation> {
    const translation = await this.themeSectionTranslationRepository.findOne({
      where: {
        sectionId,
        locale
      }
    });

    if (!translation) {
      throw new NotFoundException(`Translation not found for section ${sectionId} with locale ${locale}`);
    }

    return translation;
  }

  // Cập nhật hoặc tạo mới translation cho section
  async updateTranslation(sectionId: number, locale: string, data: {
    title?: string;
    description?: string;
    settings?: Record<string, any>;
  }): Promise<ThemeSectionTranslation> {
    // Kiểm tra xem section có tồn tại không
    const section = await this.themeSectionRepository.findOne({
      where: { id: sectionId }
    });

    if (!section) {
      throw new NotFoundException(`Section with ID ${sectionId} not found`);
    }

    // Tìm translation hiện tại
    let translation = await this.themeSectionTranslationRepository.findOne({
      where: {
        sectionId,
        locale
      }
    });

    if (translation) {
      // Cập nhật translation
      if (data.title !== undefined) translation.title = data.title;
      if (data.description !== undefined) translation.description = data.description;
      if (data.settings !== undefined) translation.settings = data.settings;
    } else {
      // Tạo translation mới
      translation = this.themeSectionTranslationRepository.create({
        sectionId,
        locale,
        title: data.title || '',
        description: data.description || '',
        settings: data.settings
      });
    }

    return this.themeSectionTranslationRepository.save(translation);
  }
} 