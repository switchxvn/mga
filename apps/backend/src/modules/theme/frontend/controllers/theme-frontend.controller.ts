import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ThemeFrontendService } from '../services/theme-frontend.service';
import { ThemeSectionFrontendService } from '../services/theme-section-frontend.service';
import { Theme } from '../../entities/theme.entity';
import { ThemeSection } from '../../entities/theme-section.entity';
import { PageType } from '@ew/shared';

@ApiTags('Frontend Themes')
@Controller('themes')
export class ThemeFrontendController {
  constructor(
    private readonly themeFrontendService: ThemeFrontendService,
    private readonly themeSectionFrontendService: ThemeSectionFrontendService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all themes' })
  @ApiResponse({ status: 200, description: 'Return all themes', type: [Theme] })
  findAll() {
    return this.themeFrontendService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get theme by id' })
  @ApiResponse({ status: 200, description: 'Return theme by id', type: Theme })
  findOne(@Param('id') id: string) {
    return this.themeFrontendService.findOne(+id);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active theme' })
  @ApiResponse({ status: 200, description: 'Return active theme', type: Theme })
  getActiveTheme(@Query('pageType') pageType: PageType) {
    return this.themeFrontendService.getActiveTheme(pageType);
  }

  @Get(':themeId/sections')
  @ApiOperation({ summary: 'Get all sections from a theme with translations' })
  @ApiResponse({ status: 200, description: 'Return all sections', type: [ThemeSection] })
  getAllSections(
    @Param('themeId') themeId: string, 
    @Query('locale') locale: string = 'en'
  ) {
    return this.themeSectionFrontendService.getAllByThemeId(+themeId, locale);
  }

  @Get(':themeId/sections/:sectionId')
  @ApiOperation({ summary: 'Get a specific section by ID with translations' })
  @ApiResponse({ status: 200, description: 'Return section by id', type: ThemeSection })
  getSection(
    @Param('themeId') themeId: string, 
    @Param('sectionId') sectionId: string,
    @Query('locale') locale: string = 'en'
  ) {
    return this.themeSectionFrontendService.getById(+themeId, +sectionId, locale);
  }

  @Get(':themeId/page-sections')
  @ApiOperation({ summary: 'Get all sections for a specific page type with translations' })
  @ApiResponse({ status: 200, description: 'Return all sections for page type', type: [ThemeSection] })
  getPageSections(
    @Param('themeId') themeId: string,
    @Query('pageType') pageType: PageType,
    @Query('locale') locale: string = 'en'
  ) {
    return this.themeSectionFrontendService.getAllByPageType(+themeId, pageType, locale);
  }
}