import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomerReviewsSection1743270380259 implements MigrationInterface {
  name = 'AddCustomerReviewsSection1743270380259';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get default theme id
    const themeResult = await queryRunner.query(`
      SELECT id FROM themes WHERE name = 'Default Theme' LIMIT 1
    `);
    const themeId = themeResult[0].id;

    // Add customer reviews section with default settings
    await queryRunner.query(`
      INSERT INTO theme_sections (theme_id, type, component_name, title, "order", settings, page_type)
      VALUES (
        ${themeId},
        'customer_reviews',
        'CustomerReviewsSection',
        'Khách hàng nói về chúng tôi',
        10,
        '{
          "layout": "slider",
          "slidesPerView": {
            "sm": 1,
            "md": 2,
            "lg": 3
          },
          "gap": "2rem",
          "padding": {
            "top": "4rem",
            "bottom": "4rem"
          },
          "autoplay": {
            "delay": 5000,
            "disableOnInteraction": false
          },
          "navigation": true,
          "pagination": true,
          "colors": {
            "background": "bg-gray-50 dark:bg-gray-800",
            "title": "text-gray-900 dark:text-white",
            "description": "text-gray-600 dark:text-gray-400",
            "quote": "text-primary-500 dark:text-primary-400"
          },
          "card": {
            "background": "bg-white dark:bg-gray-700",
            "rounded": "rounded-xl",
            "shadow": "shadow-lg",
            "padding": "p-6",
            "avatar": {
              "size": "w-16 h-16",
              "rounded": "rounded-full"
            },
            "rating": {
              "show": true,
              "color": "text-yellow-400"
            }
          }
        }'::jsonb,
        'home_page'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM theme_sections
      WHERE type = 'customer_reviews' AND component_name = 'CustomerReviewsSection'
    `);
  }
} 