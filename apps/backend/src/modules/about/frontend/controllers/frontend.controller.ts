import { Controller, Get, Param } from '@nestjs/common';
import { AboutFrontendService } from '../services/about-frontend.service';

@Controller('about')
export class AboutFrontendController {
  constructor(private readonly aboutFrontendService: AboutFrontendService) {}

  @Get()
  getActivePage() {
    return this.aboutFrontendService.getActivePage();
  }

  @Get('sections')
  getActiveSections() {
    return this.aboutFrontendService.getActiveSections();
  }

  @Get('team-members')
  getActiveTeamMembers() {
    return this.aboutFrontendService.getActiveTeamMembers();
  }

  @Get('milestones')
  getActiveMilestones() {
    return this.aboutFrontendService.getActiveMilestones();
  }

  @Get(':id')
  getPageById(@Param('id') id: number) {
    return this.aboutFrontendService.getPageById(id);
  }
} 