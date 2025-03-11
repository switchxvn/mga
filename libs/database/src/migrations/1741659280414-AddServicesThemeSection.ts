import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddServicesThemeSection1741659280414 implements MigrationInterface {
  name = 'AddServicesThemeSection1741659280414';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Lấy id của theme mặc định
    const themeResult = await queryRunner.query(`
      SELECT id FROM themes WHERE name = 'Default Theme' LIMIT 1
    `);
    const themeId = themeResult[0].id;

    // Thêm services section với cấu hình mặc định
    await queryRunner.query(`
      INSERT INTO theme_sections (theme_id, type, title, "order", settings)
      VALUES (
        ${themeId},
        'services',
        'Dịch vụ của chúng tôi',
        3,
        '{
          "layout": "grid",
          "columns": 3,
          "maxItems": 6,
          "showIcon": true,
          "showTitle": true,
          "showDescription": true,
          "showPrice": true,
          "showButton": true,
          "descriptionLength": 120,
          "gap": "1.5rem",
          "backgroundGradient": {
            "from": "rgba(0,0,0,0.7)",
            "to": "rgba(0,0,0,0)",
            "direction": "to-t"
          },
          "overlayOpacity": "0.5",
          "padding": {
            "top": "3rem",
            "bottom": "3rem"
          },
          "buttonText": "Đặt lịch ngay",
          "buttonStyle": "primary",
          "cardStyle": {
            "background": "bg-white dark:bg-gray-800",
            "shadow": "shadow-lg hover:shadow-xl",
            "border": "border border-gray-100 dark:border-gray-700",
            "rounded": "rounded-xl",
            "padding": "p-6",
            "transition": "transition-all duration-300 hover:scale-105"
          },
          "iconStyle": {
            "size": "w-12 h-12",
            "background": "bg-primary/10",
            "color": "text-primary",
            "rounded": "rounded-lg",
            "padding": "p-3"
          },
          "titleStyle": {
            "size": "text-xl",
            "weight": "font-semibold",
            "color": "text-gray-900 dark:text-white",
            "margin": "mt-4 mb-2"
          },
          "descriptionStyle": {
            "size": "text-sm",
            "color": "text-gray-600 dark:text-gray-300",
            "margin": "mb-4"
          },
          "priceStyle": {
            "size": "text-lg",
            "weight": "font-bold",
            "color": "text-primary",
            "margin": "mb-4"
          }
        }'::jsonb
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa services section
    await queryRunner.query(`
      DELETE FROM theme_sections
      WHERE type = 'services'
    `);
  }
} 