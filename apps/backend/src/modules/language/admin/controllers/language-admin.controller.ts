import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { LanguageAdminService } from '../services/language-admin.service';
import { LanguageDto } from '../../dto/language.dto';
import { TranslationDto, TranslationsRequestDto } from '../../dto/translation.dto';

@Controller('admin/languages')
export class LanguageAdminController {
  constructor(private readonly languageAdminService: LanguageAdminService) {}

  @Get()
  async getAllLanguages() {
    return this.languageAdminService.findAllLanguages();
  }

  @Get(':code')
  async getLanguageByCode(@Param('code') code: string) {
    return this.languageAdminService.findLanguageByCode(code);
  }

  @Post()
  async createLanguage(@Body() languageDto: LanguageDto) {
    return this.languageAdminService.createLanguage(languageDto);
  }

  @Put(':code')
  async updateLanguage(
    @Param('code') code: string,
    @Body() languageDto: LanguageDto,
  ) {
    return this.languageAdminService.updateLanguage(code, languageDto);
  }

  @Delete(':code')
  async deleteLanguage(@Param('code') code: string) {
    return this.languageAdminService.deleteLanguage(code);
  }

  // Translation endpoints
  @Get('translations/all')
  async getAllTranslations(
    @Query() query: TranslationsRequestDto,
  ) {
    return this.languageAdminService.findAllTranslations(
      query.languageCode,
      query.namespace,
    );
  }

  @Get('translations/:id')
  async getTranslationById(@Param('id') id: number) {
    return this.languageAdminService.findTranslationById(id);
  }

  @Post('translations')
  async createTranslation(@Body() translationDto: TranslationDto) {
    return this.languageAdminService.createTranslation(translationDto);
  }

  @Put('translations/:id')
  async updateTranslation(
    @Param('id') id: number,
    @Body() translationDto: TranslationDto,
  ) {
    return this.languageAdminService.updateTranslation(id, translationDto);
  }

  @Delete('translations/:id')
  async deleteTranslation(@Param('id') id: number) {
    return this.languageAdminService.deleteTranslation(id);
  }

  @Post('translations/import')
  async importTranslations(@Body() translations: TranslationDto[]) {
    return this.languageAdminService.importTranslations(translations);
  }
} 