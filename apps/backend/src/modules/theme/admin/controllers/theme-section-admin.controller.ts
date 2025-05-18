import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ThemeSectionAdminService } from '../services/theme-section-admin.service';
import { ThemeSection } from '../../entities/theme-section.entity';
import { ThemeSectionTranslation } from '../../entities/theme-section-translation.entity';
import { PageType } from '@ew/shared';

@ApiTags('Admin Theme Sections')
@Controller('admin/themes/:themeId/sections')
export class ThemeSectionAdminController {
  constructor(private readonly themeSectionAdminService: ThemeSectionAdminService) {}

  @Get()
  @ApiOperation({ summary: 'Get all theme sections' })
  @ApiResponse({ status: 200, description: 'Return all sections of a theme', type: [ThemeSection] })
  findAll(@Param('themeId', ParseIntPipe) themeId: number) {
    return this.themeSectionAdminService.getAllByThemeId(themeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get section by id' })
  @ApiResponse({ status: 200, description: 'Return section by id', type: ThemeSection })
  findOne(
    @Param('themeId', ParseIntPipe) themeId: number,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.themeSectionAdminService.getById(themeId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create section' })
  @ApiResponse({ status: 201, description: 'Section successfully created', type: ThemeSection })
  create(
    @Param('themeId', ParseIntPipe) themeId: number,
    @Body() createSectionDto: {
      title: string;
      type: string;
      componentName?: string;
      pageType: PageType;
      order: number;
      isActive?: boolean;
      settings?: Record<string, any>;
      locale?: string;
      description?: string;
    }
  ) {
    return this.themeSectionAdminService.create(themeId, createSectionDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update section' })
  @ApiResponse({ status: 200, description: 'Section successfully updated', type: ThemeSection })
  update(
    @Param('themeId', ParseIntPipe) themeId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSectionDto: {
      title?: string;
      type?: string;
      componentName?: string;
      pageType?: PageType;
      order?: number;
      isActive?: boolean;
      settings?: Record<string, any>;
      locale?: string;
      description?: string;
    }
  ) {
    return this.themeSectionAdminService.update(themeId, id, updateSectionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete section' })
  @ApiResponse({ status: 200, description: 'Section successfully deleted' })
  remove(
    @Param('themeId', ParseIntPipe) themeId: number,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.themeSectionAdminService.delete(themeId, id);
  }

  @Get(':id/translations')
  @ApiOperation({ summary: 'Get section translation' })
  @ApiResponse({ status: 200, description: 'Return section translation', type: ThemeSectionTranslation })
  getTranslation(
    @Param('id', ParseIntPipe) sectionId: number,
    @Query('locale') locale: string = 'en'
  ) {
    return this.themeSectionAdminService.getTranslation(sectionId, locale);
  }

  @Put(':id/translations')
  @ApiOperation({ summary: 'Update section translation' })
  @ApiResponse({ status: 200, description: 'Section translation successfully updated', type: ThemeSectionTranslation })
  updateTranslation(
    @Param('id', ParseIntPipe) sectionId: number,
    @Query('locale') locale: string = 'en',
    @Body() updateTranslationDto: {
      title?: string;
      description?: string;
      settings?: Record<string, any>;
    }
  ) {
    return this.themeSectionAdminService.updateTranslation(sectionId, locale, updateTranslationDto);
  }
} 