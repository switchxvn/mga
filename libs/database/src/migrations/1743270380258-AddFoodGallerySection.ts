import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFoodGallerySection1743270380258 implements MigrationInterface {
  name = 'AddFoodGallerySection1743270380258';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get default theme id
    const themeResult = await queryRunner.query(`
      SELECT id FROM themes WHERE name = 'Default Theme' LIMIT 1
    `);
    const themeId = themeResult[0].id;

    // Add food gallery section with default settings
    await queryRunner.query(`
      INSERT INTO theme_sections (theme_id, type, component_name, title, "order", settings, page_type)
      VALUES (
        ${themeId},
        'food_gallery',
        'FoodGallerySection',
        'Thực đơn món ăn',
        9,
        '{
          "layout": "grid",
          "columns": {
            "sm": 1,
            "md": 2,
            "lg": 3,
            "xl": 4
          },
          "gap": "1.5rem",
          "padding": {
            "top": "4rem",
            "bottom": "4rem"
          },
          "maxItems": 8,
          "showTitle": true,
          "colors": {
            "background": "bg-white dark:bg-gray-900",
            "title": "text-gray-900 dark:text-white",
            "description": "text-gray-600 dark:text-gray-400"
          },
          "useUppercase": true,
          "loadMoreButton": {
            "show": true,
            "text": "Xem thêm món ăn",
            "style": "primary"
          },
          "card": {
            "aspectRatio": "1/1",
            "rounded": "rounded-xl",
            "shadow": "shadow-lg hover:shadow-xl",
            "animation": "hover:scale-105",
            "overlay": {
              "show": true,
              "opacity": "bg-black/40",
              "content": {
                "position": "bottom",
                "padding": "p-4",
                "titleSize": "text-lg",
                "descriptionSize": "text-sm"
              }
            }
          }
        }'::jsonb,
        'home_page'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove food gallery section
    await queryRunner.query(`
      DELETE FROM theme_sections
      WHERE type = 'food_gallery' AND component_name = 'FoodGallerySection'
    `);
  }
} 