import { Controller, Get, Param, Query } from '@nestjs/common';
import { AboutFrontendService } from '../services/about-frontend.service';
import { AboutSection } from '../../entities/about-section.entity';

@Controller('about')
export class AboutFrontendController {
  constructor(private readonly aboutFrontendService: AboutFrontendService) {}

  @Get('sections')
  async getActiveSections(@Query('locale') locale: string = 'en'): Promise<AboutSection[]> {
    return this.aboutFrontendService.getActiveSections(locale);
  }

  @Get('sections/:id')
  async getSectionById(
    @Param('id') id: number,
    @Query('locale') locale: string = 'en'
  ): Promise<AboutSection | null> {
    return this.aboutFrontendService.getSectionById(id, locale);
  }
} 