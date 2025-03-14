import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AboutPage } from '../../entities/about-page.entity';
import { AboutSection } from '../../entities/about-section.entity';
import { AboutTeamMember } from '../../entities/about-team-member.entity';
import { AboutMilestone } from '../../entities/about-milestone.entity';

@Injectable()
export class AboutAdminService {
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

  async findAllPages() {
    return this.aboutPageRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findPageById(id: number) {
    return this.aboutPageRepository.findOne({
      where: { id },
      relations: ['sections', 'teamMembers', 'milestones'],
    });
  }

  async createPage(data: Partial<AboutPage>) {
    const page = this.aboutPageRepository.create(data);
    return this.aboutPageRepository.save(page);
  }

  async updatePage(id: number, data: Partial<AboutPage>) {
    await this.aboutPageRepository.update(id, data);
    return this.findPageById(id);
  }

  async deletePage(id: number) {
    return this.aboutPageRepository.delete(id);
  }

  // Section methods
  async findSectionById(id: number) {
    return this.aboutSectionRepository.findOne({
      where: { id },
      relations: ['aboutPage'],
    });
  }

  async createSection(data: Partial<AboutSection>) {
    const section = this.aboutSectionRepository.create(data);
    return this.aboutSectionRepository.save(section);
  }

  async updateSection(id: number, data: Partial<AboutSection>) {
    await this.aboutSectionRepository.update(id, data);
    return this.findSectionById(id);
  }

  async deleteSection(id: number) {
    return this.aboutSectionRepository.delete(id);
  }

  // Team member methods
  async findTeamMemberById(id: number) {
    return this.aboutTeamMemberRepository.findOne({
      where: { id },
      relations: ['aboutPage'],
    });
  }

  async createTeamMember(data: Partial<AboutTeamMember>) {
    const member = this.aboutTeamMemberRepository.create(data);
    return this.aboutTeamMemberRepository.save(member);
  }

  async updateTeamMember(id: number, data: Partial<AboutTeamMember>) {
    await this.aboutTeamMemberRepository.update(id, data);
    return this.findTeamMemberById(id);
  }

  async deleteTeamMember(id: number) {
    return this.aboutTeamMemberRepository.delete(id);
  }

  // Milestone methods
  async findMilestoneById(id: number) {
    return this.aboutMilestoneRepository.findOne({
      where: { id },
      relations: ['aboutPage'],
    });
  }

  async createMilestone(data: Partial<AboutMilestone>) {
    const milestone = this.aboutMilestoneRepository.create(data);
    return this.aboutMilestoneRepository.save(milestone);
  }

  async updateMilestone(id: number, data: Partial<AboutMilestone>) {
    await this.aboutMilestoneRepository.update(id, data);
    return this.findMilestoneById(id);
  }

  async deleteMilestone(id: number) {
    return this.aboutMilestoneRepository.delete(id);
  }
} 