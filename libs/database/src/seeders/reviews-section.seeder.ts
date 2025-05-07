import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ReviewsSectionSeeder {
  private readonly logger = new Logger(ReviewsSectionSeeder.name);

  constructor(private readonly dataSource: DataSource) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding reviews sections...');

    // Lấy theme mặc định
    const defaultTheme = await this.dataSource.query(
      `SELECT id FROM themes WHERE is_active = true LIMIT 1`
    );

    if (!defaultTheme || defaultTheme.length === 0) {
      this.logger.error('Default theme not found');
      return;
    }

    const themeId = defaultTheme[0].id;

    // Mảng các section cần tạo
    const sections = [
      {
        type: 'review_hero',
        title: 'Review Hero Section',
        componentName: 'ReviewHeroSection',
        pageType: 'reviews_page',
        order: 1,
        settings: {
          title: 'Đánh giá khách hàng',
          description: 'Xem những đánh giá chân thực từ khách hàng của chúng tôi',
          backgroundImage: '',
          backgroundColor: 'bg-primary-50',
          textColor: 'text-gray-900',
          textAlignment: 'center',
          paddingTop: 'py-8 sm:py-16',
          paddingBottom: 'pb-0'
        }
      },
      {
        type: 'review_statistics',
        title: 'Review Statistics Section',
        componentName: 'ReviewStatisticsSection',
        pageType: 'reviews_page',
        order: 2,
        settings: {
          title: 'Thống kê đánh giá',
          backgroundColor: 'bg-white',
          textColor: 'text-gray-900',
          borderColor: 'border-gray-200',
          shadowLevel: 'shadow-sm',
          padding: 'p-6',
          marginTop: 'mt-0',
          marginBottom: 'mb-0'
        }
      },
      {
        type: 'review_list',
        title: 'Review List Section',
        componentName: 'ReviewListSection',
        pageType: 'reviews_page',
        order: 3,
        settings: {
          title: 'Danh sách đánh giá',
          backgroundColor: 'bg-white',
          textColor: 'text-gray-900',
          borderColor: 'border-gray-200',
          shadowLevel: 'shadow-sm',
          padding: 'p-4',
          gridColumns: {
            mobile: 1,
            tablet: 2,
            desktop: 3
          },
          showRating: true,
          showDate: true,
          showServiceType: true,
          showProfession: true,
          showPagination: true
        }
      },
      {
        type: 'review_form',
        title: 'Review Form Section',
        componentName: 'ReviewFormSection',
        pageType: 'reviews_page',
        order: 4,
        settings: {
          title: 'Gửi đánh giá của bạn',
          description: 'Chia sẻ trải nghiệm của bạn với chúng tôi',
          backgroundColor: 'bg-white',
          textColor: 'text-gray-900',
          borderColor: 'border-gray-200',
          shadowLevel: 'shadow-sm',
          padding: 'p-6',
          marginTop: 'mt-8',
          marginBottom: 'mb-16',
          formFields: {
            showServiceType: true,
            showProfession: true,
            showVisitDate: true
          }
        }
      }
    ];

    // Tạo các section
    for (const section of sections) {
      const existingSection = await this.dataSource.query(
        `SELECT id FROM theme_sections WHERE theme_id = $1 AND type = $2 AND page_type = $3 LIMIT 1`,
        [themeId, section.type, section.pageType]
      );

      if (existingSection && existingSection.length > 0) {
        this.logger.log(`Section ${section.type} already exists, updating it...`);
        await this.dataSource.query(
          `UPDATE theme_sections 
          SET title = $1, component_name = $2, settings = $3, "order" = $4
          WHERE id = $5`,
          [
            section.title,
            section.componentName,
            JSON.stringify(section.settings),
            section.order,
            existingSection[0].id
          ]
        );
      } else {
        this.logger.log(`Creating new section ${section.type}...`);
        await this.dataSource.query(
          `INSERT INTO theme_sections 
          (theme_id, type, component_name, title, page_type, settings, "order")
          VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            themeId,
            section.type,
            section.componentName,
            section.title,
            section.pageType,
            JSON.stringify(section.settings),
            section.order
          ]
        );
      }
    }

    this.logger.log('Reviews sections seeded successfully');
  }
} 