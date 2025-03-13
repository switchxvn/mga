import { Controller, Get, Param, Query } from '@nestjs/common';
import { LanguageFrontendService } from '../services/language-frontend.service';

@Controller('languages')
export class LanguageFrontendController {
  constructor(private readonly languageFrontendService: LanguageFrontendService) {}

  @Get()
  async getActiveLanguages() {
    return this.languageFrontendService.getActiveLanguages();
  }

  @Get('default')
  async getDefaultLanguage() {
    return this.languageFrontendService.getDefaultLanguage();
  }

  @Get(':code/translations')
  async getTranslations(
    @Param('code') languageCode: string,
    @Query('namespace') namespace?: string,
  ) {
    return this.languageFrontendService.getTranslations(languageCode, namespace);
  }

  @Get(':code/translations/all')
  async getAllTranslations(@Param('code') languageCode: string) {
    return this.languageFrontendService.getAllTranslations(languageCode);
  }
} 