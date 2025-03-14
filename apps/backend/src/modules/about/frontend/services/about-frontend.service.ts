import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AboutPage } from '../../entities/about-page.entity';
import { AboutSection } from '../../entities/about-section.entity';
import { AboutTeamMember } from '../../entities/about-team-member.entity';
import { AboutMilestone } from '../../entities/about-milestone.entity';

@Injectable()
export class AboutFrontendService {
  constructor(
    @InjectRepository(AboutPage)
    private aboutPageRepository: Repository<AboutPage>,
    @InjectRepository(AboutSection)
    private aboutSectionRepository: Repository<AboutSection>,
    @InjectRepository(AboutTeamMember)
    private aboutTeamMemberRepository: Repository<AboutTeamMember>,
    @InjectRepository(AboutMilestone)
    private aboutMilestoneRepository: Repository<AboutMilestone>,
  ) {}

  async getActivePage() {
    return this.aboutPageRepository.findOne({
      where: { is_active: true },
      relations: ['sections', 'teamMembers', 'milestones'],
      order: {
        sections: { order: 'ASC' },
        teamMembers: { order: 'ASC' },
        milestones: { order: 'ASC' },
      },
    });
  }

  async getPageById(id: number) {
    return this.aboutPageRepository.findOne({
      where: { id, is_active: true },
      relations: ['sections', 'teamMembers', 'milestones'],
      order: {
        sections: { order: 'ASC' },
        teamMembers: { order: 'ASC' },
        milestones: { order: 'ASC' },
      },
    });
  }

  async getActiveSections() {
    return this.aboutSectionRepository.find({
      where: { is_active: true },
      order: { order: 'ASC' },
      relations: ['aboutPage'],
    });
  }

  async getActiveTeamMembers() {
    return this.aboutTeamMemberRepository.find({
      where: { is_active: true },
      order: { order: 'ASC' },
      relations: ['aboutPage'],
    });
  }

  async getActiveMilestones() {
    return this.aboutMilestoneRepository.find({
      where: { is_active: true },
      order: { order: 'ASC' },
      relations: ['aboutPage'],
    });
  }
} 