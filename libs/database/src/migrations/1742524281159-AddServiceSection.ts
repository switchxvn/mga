import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServiceSection1742524281159 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First get the active theme id
    const activeTheme = await queryRunner.query(`
      SELECT id FROM themes WHERE is_active = true LIMIT 1;
    `);

    if (!activeTheme || activeTheme.length === 0) {
      throw new Error('No active theme found. Please ensure there is an active theme before running this migration.');
    }

    const themeId = activeTheme[0].id;

    await queryRunner.query(`
      INSERT INTO theme_sections (
        type,
        title,
        "order",
        settings,
        is_active,
        theme_id,
        component_name
      ) VALUES (
        'services',
        'Dịch vụ của chúng tôi',
        3,
        '{
          "gap": "1.5rem",
          "layout": "grid",
          "columns": 3,
          "padding": {
            "top": "3rem",
            "bottom": "3rem"
          },
          "maxItems": 6,
          "showIcon": true,
          "cardStyle": {
            "border": "border border-gray-100 dark:border-gray-700",
            "shadow": "shadow-lg hover:shadow-xl",
            "padding": "p-6",
            "rounded": "rounded-xl",
            "background": "bg-white dark:bg-gray-800",
            "transition": "transition-all duration-300 hover:scale-105"
          },
          "iconStyle": {
            "size": "w-12 h-12",
            "color": "text-primary",
            "padding": "p-3",
            "rounded": "rounded-lg",
            "background": "bg-primary/10"
          },
          "showPrice": true,
          "showTitle": true,
          "buttonText": "Xem chi tiết",
          "priceStyle": {
            "size": "text-lg",
            "color": "text-primary",
            "margin": "mb-4",
            "weight": "font-bold"
          },
          "showButton": true,
          "titleStyle": {
            "size": "text-xl",
            "color": "text-gray-900 dark:text-white",
            "margin": "mt-4 mb-2",
            "weight": "font-semibold"
          },
          "buttonStyle": "primary",
          "overlayOpacity": "0.5",
          "showDescription": true,
          "descriptionStyle": {
            "size": "text-sm",
            "color": "text-gray-600 dark:text-gray-300",
            "margin": "mb-4"
          },
          "descriptionLength": 120,
          "backgroundGradient": {
            "to": "rgba(0,0,0,0)",
            "from": "rgba(0,0,0,0.7)",
            "direction": "to-t"
          }
        }',
        true,
        ${themeId},
        'ServiceSection'
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM theme_sections 
      WHERE type = 'services' 
      AND component_name = 'ServiceSection';
    `);
  }
} 