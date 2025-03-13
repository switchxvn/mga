import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from '../../entities/language.entity';
import { Translation } from '../../entities/translation.entity';
import { LanguageDto } from '../../dto/language.dto';
import { TranslationDto } from '../../dto/translation.dto';

@Injectable()
export class LanguageAdminService {
  constructor(
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
    @InjectRepository(Translation)
    private translationRepository: Repository<Translation>,
  ) {}

  async findAllLanguages(): Promise<Language[]> {
    return this.languageRepository.find();
  }

  async findLanguageByCode(code: string): Promise<Language> {
    const language = await this.languageRepository.findOne({ where: { code } });
    if (!language) {
      throw new NotFoundException(`Language with code ${code} not found`);
    }
    return language;
  }

  async createLanguage(languageDto: LanguageDto): Promise<Language> {
    const language = this.languageRepository.create(languageDto);
    return this.languageRepository.save(language);
  }

  async updateLanguage(code: string, languageDto: LanguageDto): Promise<Language> {
    const language = await this.findLanguageByCode(code);
    
    // If setting this language as default, unset any existing default
    if (languageDto.isDefault) {
      await this.languageRepository.update(
        { isDefault: true },
        { isDefault: false }
      );
    }
    
    Object.assign(language, languageDto);
    return this.languageRepository.save(language);
  }

  async deleteLanguage(code: string): Promise<void> {
    const language = await this.findLanguageByCode(code);
    await this.languageRepository.remove(language);
  }

  // Translation management
  async findAllTranslations(languageCode?: string, namespace?: string): Promise<Translation[]> {
    const queryBuilder = this.translationRepository.createQueryBuilder('translation');
    
    if (languageCode) {
      queryBuilder.where('translation.language_code = :languageCode', { languageCode });
    }
    
    if (namespace) {
      queryBuilder.andWhere('translation.namespace = :namespace', { namespace });
    }
    
    return queryBuilder.getMany();
  }

  async findTranslationById(id: number): Promise<Translation> {
    const translation = await this.translationRepository.findOne({ where: { id } });
    if (!translation) {
      throw new NotFoundException(`Translation with ID ${id} not found`);
    }
    return translation;
  }

  async createTranslation(translationDto: TranslationDto): Promise<Translation> {
    // Check if language exists
    await this.findLanguageByCode(translationDto.languageCode);
    
    const translation = this.translationRepository.create(translationDto);
    return this.translationRepository.save(translation);
  }

  async updateTranslation(id: number, translationDto: TranslationDto): Promise<Translation> {
    const translation = await this.findTranslationById(id);
    
    // If language code is changing, verify the new language exists
    if (translationDto.languageCode !== translation.languageCode) {
      await this.findLanguageByCode(translationDto.languageCode);
    }
    
    Object.assign(translation, translationDto);
    return this.translationRepository.save(translation);
  }

  async deleteTranslation(id: number): Promise<void> {
    const translation = await this.findTranslationById(id);
    await this.translationRepository.remove(translation);
  }

  async importTranslations(translations: TranslationDto[]): Promise<Translation[]> {
    const results: Translation[] = [];
    
    for (const translationDto of translations) {
      // Check if translation already exists
      const existing = await this.translationRepository.findOne({
        where: {
          languageCode: translationDto.languageCode,
          key: translationDto.key,
          namespace: translationDto.namespace || 'common',
        },
      });
      
      if (existing) {
        // Update existing translation
        existing.value = translationDto.value;
        results.push(await this.translationRepository.save(existing));
      } else {
        // Create new translation
        results.push(await this.createTranslation(translationDto));
      }
    }
    
    return results;
  }
} 