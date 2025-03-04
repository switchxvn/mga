import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { SeoAdminService } from '../services/seo-admin.service';
import { Seo } from '../../entities/seo.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreateSeoInput, UpdateSeoInput } from '@ew/shared';

@ApiTags('admin/seo')
@Controller('admin/seo')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('admin')
@ApiBearerAuth()
export class SeoAdminController {
  constructor(private readonly seoService: SeoAdminService) {}

  @Get()
  @ApiOperation({ summary: 'Get all SEO entries' })
  @ApiResponse({ status: 200, description: 'Return all SEO entries', type: [Seo] })
  async getAllSeo(
    @Query('pagePath') pagePath?: string,
    @Query('isActive') isActive?: boolean,
  ): Promise<Seo[]> {
    const filters = {
      ...(pagePath !== undefined && { pagePath }),
      ...(isActive !== undefined && { isActive: isActive === true }),
    };
    return this.seoService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get SEO by id' })
  @ApiResponse({ status: 200, description: 'Return SEO by id', type: Seo })
  @ApiResponse({ status: 404, description: 'SEO not found' })
  async getSeoById(@Param('id') id: number): Promise<Seo> {
    return this.seoService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create SEO' })
  @ApiResponse({ status: 201, description: 'SEO created successfully', type: Seo })
  async createSeo(@Body() data: CreateSeoInput): Promise<Seo> {
    return this.seoService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update SEO' })
  @ApiResponse({ status: 200, description: 'SEO updated successfully', type: Seo })
  @ApiResponse({ status: 404, description: 'SEO not found' })
  async updateSeo(
    @Param('id') id: number,
    @Body() data: UpdateSeoInput,
  ): Promise<Seo> {
    return this.seoService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete SEO' })
  @ApiResponse({ status: 200, description: 'SEO deleted successfully' })
  @ApiResponse({ status: 404, description: 'SEO not found' })
  async deleteSeo(@Param('id') id: number): Promise<{ success: boolean; message: string }> {
    return this.seoService.delete(id);
  }
} 