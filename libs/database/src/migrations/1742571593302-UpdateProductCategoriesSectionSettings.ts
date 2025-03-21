import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateProductCategoriesSectionSettings1742571593302 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE theme_sections 
      SET settings = jsonb_set(
        jsonb_set(
          settings,
          '{colors}',
          '{"title": "text-gray-900 dark:text-white", "description": "text-gray-600 dark:text-gray-400"}'::jsonb,
          true
        ),
        '{fontSize}',
        '{"title": "text-4xl", "description": "text-base"}'::jsonb,
        true
      )
      WHERE type = 'product_categories';
    `);

    await queryRunner.query(`
      UPDATE theme_sections 
      SET settings = jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(
                settings,
                '{layout}',
                '"grid"'::jsonb,
                true
              ),
              '{columns}',
              '4'::jsonb,
              true
            ),
            '{maxItems}',
            '8'::jsonb,
            true
          ),
          '{displayMode}',
          '"grid"'::jsonb,
          true
        ),
        '{alignment}',
        '{"header": "justify-between", "content": "text-left", "container": "items-start"}'::jsonb,
        true
      )
      WHERE type = 'product_categories';
    `);

    await queryRunner.query(`
      UPDATE theme_sections 
      SET settings = jsonb_set(
        jsonb_set(
          settings,
          '{showDescription}',
          'true'::jsonb,
          true
        ),
        '{useUppercase}',
        'false'::jsonb,
        true
      )
      WHERE type = 'product_categories';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert is not implemented as it would be complex to determine previous values
    await queryRunner.query(`
      UPDATE theme_sections 
      SET settings = settings - 'useUppercase'
      WHERE type = 'product_categories';
    `);
  }
} 