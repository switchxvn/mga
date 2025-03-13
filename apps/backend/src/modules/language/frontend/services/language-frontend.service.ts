import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from '../../entities/language.entity';
import { Translation } from '../../entities/translation.entity';
import { LanguageResponseDto } from '../../dto/language.dto';

@Injectable()
export class LanguageFrontendService {
  constructor(
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
    @InjectRepository(Translation)
    private translationRepository: Repository<Translation>,
  ) {}

  async getActiveLanguages(): Promise<LanguageResponseDto[]> {
    const languages = await this.languageRepository.find({
      where: { isActive: true },
      order: { isDefault: 'DESC', name: 'ASC' },
    });

    return languages.map(language => ({
      id: language.id,
      code: language.code,
      name: language.name,
      nativeName: language.nativeName,
      flagCode: language.flagCode,
      isActive: language.isActive,
      isDefault: language.isDefault,
    }));
  }

  async getDefaultLanguage(): Promise<LanguageResponseDto> {
    const language = await this.languageRepository.findOne({
      where: { isDefault: true },
    });

    if (!language) {
      // Fallback to first active language if no default is set
      const fallback = await this.languageRepository.findOne({
        where: { isActive: true },
        order: { id: 'ASC' },
      });

      if (fallback) {
        return {
          id: fallback.id,
          code: fallback.code,
          name: fallback.name,
          nativeName: fallback.nativeName,
          flagCode: fallback.flagCode,
          isActive: fallback.isActive,
          isDefault: fallback.isDefault,
        };
      }
      
      // If no active languages, return English as fallback
      return {
        id: 0,
        code: 'en',
        name: 'English',
        nativeName: 'English',
        flagCode: 'us',
        isActive: true,
        isDefault: true,
      };
    }

    return {
      id: language.id,
      code: language.code,
      name: language.name,
      nativeName: language.nativeName,
      flagCode: language.flagCode,
      isActive: language.isActive,
      isDefault: language.isDefault,
    };
  }

  async getTranslations(languageCode: string, namespace: string = 'common'): Promise<Record<string, string>> {
    const translations = await this.translationRepository.find({
      where: { languageCode, namespace },
    });

    // Convert to key-value object
    const result: Record<string, string> = {};
    for (const translation of translations) {
      result[translation.key] = translation.value;
    }

    return result;
  }

  async getAllTranslations(languageCode: string): Promise<Record<string, Record<string, string>>> {
    const translations = await this.translationRepository.find({
      where: { languageCode },
    });

    // Group by namespace
    const result: Record<string, Record<string, string>> = {};
    for (const translation of translations) {
      const namespace = translation.namespace || 'common';
      if (!result[namespace]) {
        result[namespace] = {};
      }
      result[namespace][translation.key] = translation.value;
    }

    return result;
  }
} 