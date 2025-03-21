import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateProductCategoriesSectionAlignment1742539493747 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update existing product_categories sections with new alignment settings
    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        settings,
        '{alignment}',
        '{
          "container": "items-start",
          "header": "justify-between",
          "content": "text-left"
        }'::jsonb,
        true
      )
      WHERE type = 'product_categories'
    `);

    // Update sections that have textAlign setting to convert to new alignment structure
    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        settings,
        '{alignment}',
        CASE 
          WHEN settings->>'textAlign' = 'center' THEN
            '{
              "container": "items-center",
              "header": "justify-center flex-col",
              "content": "text-center"
            }'::jsonb
          WHEN settings->>'textAlign' = 'right' THEN
            '{
              "container": "items-end",
              "header": "justify-end",
              "content": "text-right"
            }'::jsonb
          ELSE
            '{
              "container": "items-start",
              "header": "justify-between",
              "content": "text-left"
            }'::jsonb
        END,
        true
      )
      WHERE type = 'product_categories'
      AND settings->>'textAlign' IS NOT NULL
    `);

    // Remove old textAlign field
    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = settings - 'textAlign'
      WHERE type = 'product_categories'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Convert back to old textAlign format
    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        settings,
        '{textAlign}',
        CASE 
          WHEN settings->'alignment'->>'container' = 'items-center' THEN '"center"'
          WHEN settings->'alignment'->>'container' = 'items-end' THEN '"right"'
          ELSE '"left"'
        END::jsonb,
        true
      )
      WHERE type = 'product_categories'
    `);

    // Remove new alignment field
    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = settings - 'alignment'
      WHERE type = 'product_categories'
    `);
  }
} 