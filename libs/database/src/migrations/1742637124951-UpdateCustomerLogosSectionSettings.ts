import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCustomerLogosSectionSettings1742637124951 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE theme_sections 
      SET settings = '{
        "gap": "2rem",
        "autoplay": true,
        "darkMode": {
          "textColor": "",
          "backgroundColor": ""
        },
        "interval": 3000,
        "logoWidth": "auto",
        "showTitle": true,
        "logoHeight": "80px",
        "showArrows": true,
        "displayType": "grid",
        "gridColumns": {
          "lg": 5,
          "md": 4,
          "sm": 3,
          "xl": 6,
          "base": 2
        },
        "slidesToShow": {
          "lg": 5,
          "md": 4,
          "sm": 3,
          "xl": 6,
          "base": 2
        },
        "titleAlignment": "center",
        "backgroundColor": "",
        "containerPadding": "4rem",
        "fontSize": {
          "title": "text-2xl sm:text-3xl"
        },
        "useUppercase": true,
        "colors": {
          "title": "text-gray-900 dark:text-white"
        },
        "headerStyle": {
          "background": "bg-primary-600 dark:bg-primary-500",
          "rounded": "rounded-lg",
          "padding": "py-3"
        }
      }'::jsonb
      WHERE type = 'customer_logos'
      AND component_name = 'CustomerLogosSection';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE theme_sections 
      SET settings = '{
        "gap": "2rem",
        "autoplay": true,
        "darkMode": {
          "textColor": "",
          "backgroundColor": ""
        },
        "interval": 3000,
        "logoWidth": "auto",
        "showTitle": true,
        "logoHeight": "80px",
        "showArrows": true,
        "displayType": "grid",
        "gridColumns": {
          "lg": 5,
          "md": 4,
          "sm": 3,
          "xl": 6,
          "base": 2
        },
        "slidesToShow": {
          "lg": 5,
          "md": 4,
          "sm": 3,
          "xl": 6,
          "base": 2
        },
        "titleAlignment": "center",
        "backgroundColor": "",
        "containerPadding": "4rem"
      }'::jsonb
      WHERE type = 'customer_logos'
      AND component_name = 'CustomerLogosSection';
    `);
  }
} 