import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AboutAdminService } from '../services/about-admin.service';
import { AboutSection } from '../../entities/about-section.entity';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
// Tạm thời comment các guard và decorator không tìm thấy
// import { RolesGuard } from '../../../auth/guards/roles.guard';
// import { Roles } from '../../../auth/decorators/roles.decorator';

@Controller('admin/about')
@UseGuards(JwtAuthGuard)
// @Roles('admin')
export class AboutAdminController {
  constructor(private readonly aboutAdminService: AboutAdminService) {}

  // Section endpoints
  @Get('sections')
  async getAllSections(): Promise<AboutSection[]> {
    return this.aboutAdminService.findAllSections();
  }

  @Get('sections/:id')
  async getSection(@Param('id') id: number): Promise<AboutSection> {
    return this.aboutAdminService.findSectionById(id);
  }

  @Post('sections')
  async createSection(@Body() section: Partial<AboutSection>): Promise<AboutSection> {
    return this.aboutAdminService.createSection(section);
  }

  @Put('sections/:id')
  async updateSection(
    @Param('id') id: number,
    @Body() section: Partial<AboutSection>
  ): Promise<AboutSection> {
    return this.aboutAdminService.updateSection(id, section);
  }

  @Delete('sections/:id')
  async deleteSection(@Param('id') id: number): Promise<void> {
    return this.aboutAdminService.deleteSection(id);
  }

  @Put('sections/order')
  async updateSectionsOrder(@Body() sections: { id: number; order: number }[]): Promise<void> {
    return this.aboutAdminService.updateSectionsOrder(sections);
  }
} 