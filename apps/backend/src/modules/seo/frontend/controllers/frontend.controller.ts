import { Controller, Get, Param, Query } from '@nestjs/common';
import { SeoFrontendService } from '../services/seo-frontend.service';
import { Seo } from '../../entities/seo.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetSeoQueryDto } from '../dto/seo.dto';

@ApiTags('seo')
@Controller('seo')
export class SeoFrontendController {
  constructor(private readonly seoService: SeoFrontendService) {}

  @Get()
  @ApiOperation({ summary: 'Get active SEO entries' })
  @ApiResponse({ status: 200, description: 'Return active SEO entries', type: [Seo] })
  async getActiveSeo(@Query() query: GetSeoQueryDto): Promise<Seo[]> {
    const { pagePath } = query;
    const filters = {
      ...(pagePath !== undefined && { pagePath }),
    };
    return this.seoService.findActiveSeo(filters);
  }

  @Get(':pagePath')
  @ApiOperation({ summary: 'Get active SEO by page path' })
  @ApiResponse({ status: 200, description: 'Return active SEO by page path', type: Seo })
  @ApiResponse({ status: 404, description: 'SEO not found' })
  async getActiveSeoByPath(@Param('pagePath') pagePath: string): Promise<Seo> {
    return this.seoService.findActiveSeoByPath(pagePath);
  }
} 