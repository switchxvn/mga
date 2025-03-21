import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateProductCategoriesSection1742538507613 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update existing product_categories sections with new settings
    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        jsonb_set(
          jsonb_set(
            settings,
            '{textAlign}',
            '"left"'::jsonb,
            true
          ),
          '{fontSize}',
          '{
            "title": "text-2xl",
            "description": "text-base"
          }'::jsonb,
          true
        ),
        '{colors}',
        '{
          "title": "text-gray-900 dark:text-white",
          "description": "text-gray-600 dark:text-gray-400"
        }'::jsonb,
        true
      )
      WHERE type = 'product_categories'
      AND (settings->>'layout' IS NULL OR settings->>'textAlign' IS NULL)
    `);

    // Update sections that don't have the basic required settings
    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        COALESCE(settings, '{}'::jsonb),
        '{}'::text[],
        '{
          "layout": "split",
          "columns": 4,
          "maxItems": 8,
          "categoryIds": [1, 2, 3],
          "displayMode": "grid",
          "showDescription": true,
          "textAlign": "left",
          "fontSize": {
            "title": "text-2xl",
            "description": "text-base"
          },
          "colors": {
            "title": "text-gray-900 dark:text-white",
            "description": "text-gray-600 dark:text-gray-400"
          }
        }'::jsonb
      )
      WHERE type = 'product_categories'
      AND (
        settings IS NULL
        OR settings->>'layout' IS NULL
        OR settings->>'columns' IS NULL
        OR settings->>'maxItems' IS NULL
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the new fields from settings
    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = settings - 'textAlign' - 'fontSize' - 'colors'
      WHERE type = 'product_categories'
    `);
  }
} 