import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from './entities/language.entity';
import { Translation } from './entities/translation.entity';
import { LanguageAdminController } from './admin/controllers/language-admin.controller';
import { LanguageFrontendController } from './frontend/controllers/language-frontend.controller';
import { LanguageAdminService } from './admin/services/language-admin.service';
import { LanguageFrontendService } from './frontend/services/language-frontend.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Language,
      Translation
    ])
  ],
  controllers: [LanguageAdminController, LanguageFrontendController],
  providers: [
    LanguageAdminService,
    LanguageFrontendService
  ],
  exports: [
    LanguageAdminService,
    LanguageFrontendService
  ],
})
export class LanguageModule {} 