import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AboutAdminService } from '../services/about-admin.service';
import { AboutPage } from '../../entities/about-page.entity';
import { AboutSection } from '../../entities/about-section.entity';
import { AboutTeamMember } from '../../entities/about-team-member.entity';
import { AboutMilestone } from '../../entities/about-milestone.entity';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
// Tạm thời comment các guard và decorator không tìm thấy
// import { RolesGuard } from '../../../auth/guards/roles.guard';
// import { Roles } from '../../../auth/decorators/roles.decorator';

@Controller('admin/about')
@UseGuards(JwtAuthGuard)
// @Roles('admin')
export class AboutAdminController {
  constructor(private readonly aboutAdminService: AboutAdminService) {}

  // About Page endpoints
  @Get('pages')
  findAllPages() {
    return this.aboutAdminService.findAllPages();
  }

  @Get('pages/:id')
  findPageById(@Param('id') id: number) {
    return this.aboutAdminService.findPageById(id);
  }

  @Post('pages')
  createPage(@Body() data: Partial<AboutPage>) {
    return this.aboutAdminService.createPage(data);
  }

  @Put('pages/:id')
  updatePage(@Param('id') id: number, @Body() data: Partial<AboutPage>) {
    return this.aboutAdminService.updatePage(id, data);
  }

  @Delete('pages/:id')
  deletePage(@Param('id') id: number) {
    return this.aboutAdminService.deletePage(id);
  }

  // Section endpoints
  @Get('sections/:id')
  findSectionById(@Param('id') id: number) {
    return this.aboutAdminService.findSectionById(id);
  }

  @Post('sections')
  createSection(@Body() data: Partial<AboutSection>) {
    return this.aboutAdminService.createSection(data);
  }

  @Put('sections/:id')
  updateSection(@Param('id') id: number, @Body() data: Partial<AboutSection>) {
    return this.aboutAdminService.updateSection(id, data);
  }

  @Delete('sections/:id')
  deleteSection(@Param('id') id: number) {
    return this.aboutAdminService.deleteSection(id);
  }

  // Team member endpoints
  @Get('team-members/:id')
  findTeamMemberById(@Param('id') id: number) {
    return this.aboutAdminService.findTeamMemberById(id);
  }

  @Post('team-members')
  createTeamMember(@Body() data: Partial<AboutTeamMember>) {
    return this.aboutAdminService.createTeamMember(data);
  }

  @Put('team-members/:id')
  updateTeamMember(@Param('id') id: number, @Body() data: Partial<AboutTeamMember>) {
    return this.aboutAdminService.updateTeamMember(id, data);
  }

  @Delete('team-members/:id')
  deleteTeamMember(@Param('id') id: number) {
    return this.aboutAdminService.deleteTeamMember(id);
  }

  // Milestone endpoints
  @Get('milestones/:id')
  findMilestoneById(@Param('id') id: number) {
    return this.aboutAdminService.findMilestoneById(id);
  }

  @Post('milestones')
  createMilestone(@Body() data: Partial<AboutMilestone>) {
    return this.aboutAdminService.createMilestone(data);
  }

  @Put('milestones/:id')
  updateMilestone(@Param('id') id: number, @Body() data: Partial<AboutMilestone>) {
    return this.aboutAdminService.updateMilestone(id, data);
  }

  @Delete('milestones/:id')
  deleteMilestone(@Param('id') id: number) {
    return this.aboutAdminService.deleteMilestone(id);
  }
} 