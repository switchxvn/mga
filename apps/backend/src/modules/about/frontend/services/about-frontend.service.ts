import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, Repository } from 'typeorm';
import { AboutPage } from '../../entities/about-page.entity';
import { AboutSection } from '../../entities/about-section.entity';
import { AboutTeamMember } from '../../entities/about-team-member.entity';
import { AboutMilestone } from '../../entities/about-milestone.entity';

@Injectable()
export class AboutFrontendService {
  constructor(
    @InjectRepository(AboutPage)
    private readonly aboutPageRepository: Repository<AboutPage>,
    @InjectRepository(AboutSection)
    private readonly aboutSectionRepository: Repository<AboutSection>,
    @InjectRepository(AboutTeamMember)
    private readonly aboutTeamMemberRepository: Repository<AboutTeamMember>,
    @InjectRepository(AboutMilestone)
    private readonly aboutMilestoneRepository: Repository<AboutMilestone>,
  ) {}

  async getActivePage(options?: { relations?: FindOptionsRelations<AboutPage> }) {
    const page = await this.aboutPageRepository.findOne({
      where: {
        isActive: true,
      },
      relations: {
        translations: true,
        sections: {
          translations: true,
        },
        teamMembers: {
          translations: true,
        },
        milestones: {
          translations: true,
        },
      },
    });

    if (!page) return null;

    // Sort related entities
    if (page.sections) {
      page.sections.sort((a, b) => a.order - b.order);
    }
    if (page.teamMembers) {
      page.teamMembers.sort((a, b) => a.order - b.order);
    }
    if (page.milestones) {
      page.milestones.sort((a, b) => a.order - b.order);
    }

    return page;
  }

  async getActivePageTranslation(languageCode: string) {
    const page = await this.aboutPageRepository.findOne({
      where: {
        isActive: true,
      },
      relations: {
        translations: true,
        sections: {
          translations: true,
        },
        teamMembers: {
          translations: true,
        },
        milestones: {
          translations: true,
        },
      },
    });

    if (!page) return null;

    // Sort related entities
    if (page.sections) {
      page.sections.sort((a, b) => a.order - b.order);
    }
    if (page.teamMembers) {
      page.teamMembers.sort((a, b) => a.order - b.order);
    }
    if (page.milestones) {
      page.milestones.sort((a, b) => a.order - b.order);
    }

    // Get translations for the specified language
    const pageTranslation = page.translations.find(t => t.languageCode === languageCode);
    if (!pageTranslation) return page;

    // Create a new object with translated content
    return {
      ...page,
      title: pageTranslation.title || page.title,
      subtitle: pageTranslation.subtitle || page.subtitle,
      metaTitle: pageTranslation.metaTitle || page.metaTitle,
      metaDescription: pageTranslation.metaDescription || page.metaDescription,
      sections: page.sections.map(section => {
        const sectionTranslation = section.translations.find(t => t.languageCode === languageCode);
        return {
          ...section,
          title: sectionTranslation?.title || section.title,
          content: sectionTranslation?.content || section.content,
        };
      }),
      teamMembers: page.teamMembers.map(member => {
        const memberTranslation = member.translations.find(t => t.languageCode === languageCode);
        return {
          ...member,
          name: memberTranslation?.name || member.name,
          position: memberTranslation?.position || member.position,
          bio: memberTranslation?.bio || member.bio,
        };
      }),
      milestones: page.milestones.map(milestone => {
        const milestoneTranslation = milestone.translations.find(t => t.languageCode === languageCode);
        return {
          ...milestone,
          title: milestoneTranslation?.title || milestone.title,
          description: milestoneTranslation?.description || milestone.description,
        };
      }),
    };
  }

  async getPageById(id: number) {
    const page = await this.aboutPageRepository.findOne({
      where: {
        id,
        isActive: true,
      },
      relations: {
        translations: true,
        sections: {
          translations: true,
        },
        teamMembers: {
          translations: true,
        },
        milestones: {
          translations: true,
        },
      },
    });

    if (!page) return null;

    // Sort related entities
    if (page.sections) {
      page.sections.sort((a, b) => a.order - b.order);
    }
    if (page.teamMembers) {
      page.teamMembers.sort((a, b) => a.order - b.order);
    }
    if (page.milestones) {
      page.milestones.sort((a, b) => a.order - b.order);
    }

    return page;
  }

  async getActiveSections() {
    const sections = await this.aboutSectionRepository.find({
      where: {
        isActive: true,
      },
      relations: {
        aboutPage: true,
        translations: true,
      },
    });

    return sections.sort((a, b) => a.order - b.order);
  }

  async getActiveTeamMembers() {
    const members = await this.aboutTeamMemberRepository.find({
      where: {
        isActive: true,
      },
      relations: {
        aboutPage: true,
        translations: true,
      },
    });

    return members.sort((a, b) => a.order - b.order);
  }

  async getActiveMilestones() {
    const milestones = await this.aboutMilestoneRepository.find({
      where: {
        isActive: true,
      },
      relations: {
        aboutPage: true,
        translations: true,
      },
    });

    return milestones.sort((a, b) => a.order - b.order);
  }
} 