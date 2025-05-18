import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ThemeSection } from '../../entities/theme-section.entity';
import { Theme } from '../../entities/theme.entity';
import { PageType, ThemeSectionTranslation } from '@ew/shared';

@Injectable()
export class ThemeSectionFrontendService {
  constructor(
    @InjectRepository(ThemeSection)
    private readonly themeSectionRepository: Repository<ThemeSection>,
    @InjectRepository(Theme)
    private readonly themeRepository: Repository<Theme>
  ) {}

  // Lấy tất cả section theo themeId và locale
  async getAllByThemeId(themeId: number, locale: string = 'en'): Promise<ThemeSection[]> {
    console.log('getAllByThemeId called with locale:', locale);
    
    // Kiểm tra theme có tồn tại không
    const themeExists = await this.themeRepository.findOne({
      where: { id: themeId }
    });

    if (!themeExists) {
      throw new NotFoundException(`Theme with ID ${themeId} not found`);
    }

    // Sử dụng QueryBuilder để lấy các sections có bản dịch phù hợp với locale
    const query = this.themeSectionRepository.createQueryBuilder('themeSection')
      .innerJoinAndSelect(
        'themeSection.translations', 
        'translation',
        'translation.locale = :locale', 
        { locale }
      )
      .where('themeSection.themeId = :themeId', { themeId })
      .orderBy('themeSection.order', 'ASC');
    
    const sql = query.getSql();
    const params = query.getParameters();
    console.log('SQL Query:', sql);
    console.log('Parameters:', params);
    
    const sections = await query.getMany();
    console.log(`Found ${sections.length} sections with translations for locale '${locale}'`);

    // Với mỗi section, bản dịch đã được lọc theo locale
    return sections.map(section => {
      // Đã lọc theo INNER JOIN nên chắc chắn có bản dịch
      const translation = section.translations[0];
      
      // Gộp dữ liệu translation vào section
      section.title = translation.title;
      section.settings = translation.settings || section.settings;
      
      return section;
    });
  }

  // Lấy một section cụ thể theo ID
  async getById(themeId: number, sectionId: number, locale: string = 'en'): Promise<ThemeSection> {
    console.log('getById called with locale:', locale);
    
    // Sử dụng QueryBuilder để lấy section với bản dịch phù hợp với locale
    const query = this.themeSectionRepository.createQueryBuilder('themeSection')
      .innerJoinAndSelect(
        'themeSection.translations', 
        'translation',
        'translation.locale = :locale', 
        { locale }
      )
      .where('themeSection.id = :sectionId', { sectionId })
      .andWhere('themeSection.themeId = :themeId', { themeId });
    
    const sql = query.getSql();
    const params = query.getParameters();
    console.log('SQL Query:', sql);
    console.log('Parameters:', params);
    
    const section = await query.getOne();
    
    if (!section) {
      throw new NotFoundException(`Section with ID ${sectionId} not found in theme ${themeId} with locale ${locale}`);
    }
    
    console.log(`Found section with ${section.translations?.length || 0} translations`);

    // Sử dụng bản dịch đã được lọc
    const translation = section.translations[0];
    
    // Gộp dữ liệu translation vào section
    section.title = translation.title;
    section.settings = translation.settings || section.settings;

    return section;
  }

  // Lấy tất cả section theo pageType
  async getAllByPageType(themeId: number, pageType: PageType, locale: string = 'en'): Promise<ThemeSection[]> {
    console.log('getAllByPageType called with locale:', locale);
    
    // Sử dụng QueryBuilder để lấy các sections có bản dịch phù hợp với locale
    const query = this.themeSectionRepository.createQueryBuilder('themeSection')
      .innerJoinAndSelect(
        'themeSection.translations', 
        'translation',
        'translation.locale = :locale', 
        { locale }
      )
      .where('themeSection.themeId = :themeId', { themeId })
      .andWhere('themeSection.pageType = :pageType', { pageType })
      .andWhere('themeSection.isActive = :isActive', { isActive: true })
      .orderBy('themeSection.order', 'ASC');
    
    const sql = query.getSql();
    const params = query.getParameters();
    console.log('SQL Query:', sql);
    console.log('Parameters:', params);
    
    const sections = await query.getMany();
    console.log(`Found ${sections.length} sections with translations for locale '${locale}'`);

    // Với mỗi section, bản dịch đã được lọc theo locale
    return sections.map(section => {
      // Đã lọc theo INNER JOIN nên chắc chắn có bản dịch
      const translation = section.translations[0];
      
      // Gộp dữ liệu translation vào section
      section.title = translation.title;
      section.settings = translation.settings || section.settings;
      
      return section;
    });
  }
} 