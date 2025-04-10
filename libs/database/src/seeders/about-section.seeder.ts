import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AboutSection, AboutSectionType } from '../../../../apps/backend/src/modules/about/entities/about-section.entity';
import { AboutSectionTranslation } from '../../../../apps/backend/src/modules/about/entities/about-section-translation.entity';

@Injectable()
export class AboutSectionSeeder {
  private readonly logger = new Logger(AboutSectionSeeder.name);

  constructor(
    @InjectRepository(AboutSection)
    private readonly sectionRepository: Repository<AboutSection>,
    @InjectRepository(AboutSectionTranslation)
    private readonly sectionTranslationRepository: Repository<AboutSectionTranslation>
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting about section seeding...');

    // Kiểm tra xem đã có sections chưa
    const existingSections = await this.sectionRepository.count();

    if (existingSections > 0) {
      this.logger.log('About sections already exist, skipping seed');
      return;
    }

    try {
      // 1. Hero Section
      this.logger.log('Creating hero section...');
      const heroSection = await this.createSection({
        type: AboutSectionType.HERO,
        componentName: 'AboutHeroSection',
        order: 1,
        settings: {
          layout: 'default',
          heroHeight: '600px',
          heroBackgroundImage: '/images/about/hero-bg.jpg',
          heroOverlayOpacity: 0.6,
          backgroundColor: '',
          textColor: 'text-white',
          padding: '0',
          animation: {
            enabled: true,
            type: 'fade',
            duration: 1000,
            delay: 0
          }
        }
      }, {
        vi: {
          title: 'Về Chúng Tôi',
          subtitle: 'Hơn 10 năm kinh nghiệm trong lĩnh vực du lịch',
          content: 'Chúng tôi tự hào mang đến những trải nghiệm du lịch tuyệt vời nhất cho khách hàng'
        },
        en: {
          title: 'About Us',
          subtitle: 'Over 10 years of experience in tourism',
          content: 'We are proud to bring the best travel experiences to our customers'
        }
      });

      // 2. Content Section
      this.logger.log('Creating content section...');
      const contentSection = await this.createSection({
        type: AboutSectionType.CONTENT,
        componentName: 'AboutContentSection',
        order: 2,
        settings: {
          layout: 'default',
          contentLayout: 'text-image',
          imageUrl: '/images/about/content-1.jpg',
          imagePosition: 'right',
          imageWidth: '50%',
          backgroundColor: 'bg-white dark:bg-gray-900',
          textColor: 'text-gray-900 dark:text-white',
          padding: '4rem 0',
          animation: {
            enabled: true,
            type: 'fade-up',
            duration: 1000,
            delay: 200
          }
        }
      }, {
        vi: {
          title: 'Câu Chuyện Của Chúng Tôi',
          subtitle: 'Hành trình phát triển',
          content: '<p>Được thành lập từ năm 2010, chúng tôi đã không ngừng phát triển và mở rộng dịch vụ...</p>'
        },
        en: {
          title: 'Our Story',
          subtitle: 'Development Journey',
          content: '<p>Established in 2010, we have continuously grown and expanded our services...</p>'
        }
      });

      // 3. Team Section
      this.logger.log('Creating team section...');
      const teamSection = await this.createSection({
        type: AboutSectionType.TEAM,
        componentName: 'AboutTeamSection',
        order: 3,
        settings: {
          layout: 'default',
          teamLayout: 'grid',
          teamColumns: 3,
          backgroundColor: 'bg-gray-50 dark:bg-gray-800',
          textColor: 'text-gray-900 dark:text-white',
          padding: '4rem 0',
          animation: {
            enabled: true,
            type: 'fade-up',
            duration: 1000,
            delay: 200
          },
          teamMembers: [
            {
              name: 'Nguyễn Văn A',
              position: 'CEO',
              imageUrl: '/images/about/team-1.jpg',
              bio: 'Hơn 15 năm kinh nghiệm trong ngành du lịch',
              socialLinks: {
                facebook: 'https://facebook.com',
                linkedin: 'https://linkedin.com'
              }
            },
            {
              name: 'Trần Thị B',
              position: 'Marketing Director',
              imageUrl: '/images/about/team-2.jpg',
              bio: '10 năm kinh nghiệm marketing du lịch',
              socialLinks: {
                facebook: 'https://facebook.com',
                twitter: 'https://twitter.com'
              }
            }
          ]
        }
      }, {
        vi: {
          title: 'Đội Ngũ Của Chúng Tôi',
          subtitle: 'Gặp gỡ những người tạo nên sự khác biệt',
          content: 'Đội ngũ chuyên nghiệp với nhiều năm kinh nghiệm trong ngành du lịch',
          data: {
            teamMembers: [
              {
                name: 'Nguyễn Văn A',
                position: 'Giám đốc điều hành',
                bio: 'Hơn 15 năm kinh nghiệm trong ngành du lịch'
              },
              {
                name: 'Trần Thị B',
                position: 'Giám đốc marketing',
                bio: '10 năm kinh nghiệm marketing du lịch'
              }
            ]
          }
        },
        en: {
          title: 'Our Team',
          subtitle: 'Meet the people who make the difference',
          content: 'Professional team with many years of experience in tourism',
          data: {
            teamMembers: [
              {
                name: 'Nguyen Van A',
                position: 'CEO',
                bio: 'Over 15 years of experience in tourism'
              },
              {
                name: 'Tran Thi B',
                position: 'Marketing Director',
                bio: '10 years of experience in tourism marketing'
              }
            ]
          }
        }
      });

      // 4. Milestone Section
      this.logger.log('Creating milestone section...');
      const milestoneSection = await this.createSection({
        type: AboutSectionType.MILESTONE,
        componentName: 'AboutMilestoneSection',
        order: 4,
        settings: {
          layout: 'default',
          milestoneLayout: 'timeline',
          backgroundColor: 'bg-white dark:bg-gray-900',
          textColor: 'text-gray-900 dark:text-white',
          padding: '4rem 0',
          animation: {
            enabled: true,
            type: 'fade-up',
            duration: 1000,
            delay: 200
          },
          milestones: [
            {
              year: '2010',
              title: 'Thành lập công ty',
              description: 'Bắt đầu hành trình với dịch vụ du lịch cơ bản',
              imageUrl: '/images/about/milestone-1.jpg'
            },
            {
              year: '2015',
              title: 'Mở rộng thị trường',
              description: 'Phát triển thêm nhiều tour du lịch mới',
              imageUrl: '/images/about/milestone-2.jpg'
            },
            {
              year: '2020',
              title: 'Chuyển đổi số',
              description: 'Áp dụng công nghệ vào quy trình vận hành',
              imageUrl: '/images/about/milestone-3.jpg'
            }
          ]
        }
      }, {
        vi: {
          title: 'Cột Mốc Phát Triển',
          subtitle: 'Hành trình phát triển của chúng tôi',
          content: 'Những dấu mốc quan trọng trong quá trình phát triển',
          data: {
            milestones: [
              {
                year: '2010',
                title: 'Thành lập công ty',
                description: 'Bắt đầu hành trình với dịch vụ du lịch cơ bản'
              },
              {
                year: '2015',
                title: 'Mở rộng thị trường',
                description: 'Phát triển thêm nhiều tour du lịch mới'
              },
              {
                year: '2020',
                title: 'Chuyển đổi số',
                description: 'Áp dụng công nghệ vào quy trình vận hành'
              }
            ]
          }
        },
        en: {
          title: 'Development Milestones',
          subtitle: 'Our development journey',
          content: 'Important milestones in our development process',
          data: {
            milestones: [
              {
                year: '2010',
                title: 'Company Establishment',
                description: 'Started the journey with basic travel services'
              },
              {
                year: '2015',
                title: 'Market Expansion',
                description: 'Developed more new tours'
              },
              {
                year: '2020',
                title: 'Digital Transformation',
                description: 'Applied technology to operations'
              }
            ]
          }
        }
      });

      this.logger.log('About sections seeded successfully');
    } catch (error) {
      this.logger.error(`Error seeding about sections: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }

  private async createSection(
    sectionData: Partial<AboutSection>,
    translations: {
      vi: {
        title: string;
        subtitle?: string;
        content?: string;
        data?: Record<string, any>;
      };
      en: {
        title: string;
        subtitle?: string;
        content?: string;
        data?: Record<string, any>;
      };
    }
  ): Promise<AboutSection> {
    // Create section
    const section = this.sectionRepository.create({
      ...sectionData,
      isActive: true
    });
    const savedSection = await this.sectionRepository.save(section);

    // Create translations
    const translationsToSave = [
      {
        sectionId: savedSection.id,
        locale: 'vi',
        ...translations.vi
      },
      {
        sectionId: savedSection.id,
        locale: 'en',
        ...translations.en
      }
    ];

    await this.sectionTranslationRepository.save(translationsToSave);

    return savedSection;
  }
} 