import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateHeroSectionSettings1742524280159 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Deactivate existing hero sections
    await queryRunner.query(`
      UPDATE theme_sections
      SET is_active = false
      WHERE type = 'hero'
    `);

    // 2. Insert new hero_full_width sections based on existing hero sections
    await queryRunner.query(`
      INSERT INTO theme_sections (
        theme_id,
        type,
        component_name,
        title,
        "order",
        page_type,
        settings,
        is_active,
        created_at,
        updated_at
      )
      SELECT 
        theme_id,
        'hero_full_width' as type,
        'HeroSectionFullWidth' as component_name,
        title,
        "order",
        page_type,
        jsonb_build_object(
          'height', '600px',
          'autoplay', true,
          'interval', 5000,
          'showDots', true,
          'showArrows', true,
          'layout', 'full-width',
          'sliderWidth', '100%',
          'backgroundGradient', jsonb_build_object(
            'from', 'rgba(0,0,0,0.7)',
            'to', 'rgba(0,0,0,0)',
            'direction', 'to-t'
          ),
          'overlayOpacity', '0.5',
          'containerClass', 'container-fluid px-0'
        ) as settings,
        true as is_active,
        NOW() as created_at,
        NOW() as updated_at
      FROM theme_sections
      WHERE type = 'hero'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Delete hero_full_width sections
    await queryRunner.query(`
      DELETE FROM theme_sections
      WHERE type = 'hero_full_width'
    `);

    // 2. Reactivate original hero sections
    await queryRunner.query(`
      UPDATE theme_sections
      SET is_active = true
      WHERE type = 'hero'
    `);
  }
} 