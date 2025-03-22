import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateFeaturedProductsSections1742637124948 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Deactivate old featured_products section
    await queryRunner.query(`
      UPDATE theme_sections 
      SET is_active = false 
      WHERE type = 'featured_products'
    `);

    // Insert new styled_featured_products section
    await queryRunner.query(`
      INSERT INTO theme_sections (
        theme_id,
        type,
        component_name,
        title,
        "order",
        page_type,
        settings,
        is_active
      )
      SELECT 
        theme_id,
        'styled_featured_products',
        'StyledFeaturedProductsSection',
        'Sản phẩm nổi bật',
        "order",
        page_type,
        jsonb_set(
          jsonb_set(
            settings,
            '{layout}',
            '"slider"'
          ),
          '{displayMode}',
          '"slider"'
        ) || jsonb '{
          "maxItems": 8,
          "showPrice": true,
          "showRating": true,
          "showButton": true,
          "buttonText": "Xem chi tiết",
          "buttonStyle": "solid",
          "gap": "1rem",
          "slidesPerView": {
            "desktop": 4,
            "tablet": 2,
            "mobile": 1
          },
          "autoplay": true,
          "interval": 5000,
          "showDots": true,
          "showArrows": true,
          "fontSize": {
            "title": "text-2xl sm:text-3xl"
          },
          "useUppercase": true,
          "colors": {
            "title": "text-white"
          }
        }',
        true
      FROM theme_sections
      WHERE type = 'featured_products'
      AND is_active = false
      LIMIT 1;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reactivate old featured_products section
    await queryRunner.query(`
      UPDATE theme_sections 
      SET is_active = true 
      WHERE type = 'featured_products'
    `);

    // Delete new styled_featured_products section
    await queryRunner.query(`
      DELETE FROM theme_sections 
      WHERE type = 'styled_featured_products'
    `);
  }
} 