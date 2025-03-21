import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVideoIntroSection1742524281161 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First get the active theme id
    const activeTheme = await queryRunner.query(`
      SELECT id FROM themes WHERE is_active = true LIMIT 1;
    `);

    if (!activeTheme || activeTheme.length === 0) {
      throw new Error('No active theme found. Please ensure there is an active theme before running this migration.');
    }

    const themeId = activeTheme[0].id;

    // Check if video intro section already exists
    const existingSection = await queryRunner.query(`
      SELECT id FROM theme_sections WHERE type = 'video_intro' LIMIT 1;
    `);

    // Only add the section if it doesn't exist
    if (!existingSection || existingSection.length === 0) {
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
          'video_intro',
          'Video giới thiệu',
          8,
          '{
            "gap": "1rem",
            "layout": "grid",
            "columns": 3,
            "padding": {
              "top": "2rem",
              "bottom": "2rem"
            },
            "maxItems": 3,
            "showTitle": true,
            "showDescription": true,
            "sliderSettings": {
              "autoplay": true,
              "autoplaySpeed": 5000,
              "pauseOnHover": true,
              "arrows": true,
              "dots": true
            },
            "imageAspectRatio": "16/9",
            "backgroundGradient": {
              "to": "rgba(0,0,0,0)",
              "from": "rgba(0,0,0,0.7)",
              "direction": "to-t"
            }
          }',
          true,
          ${themeId},
          'VideoIntroSection'
        );
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM theme_sections 
      WHERE type = 'video_intro' 
      AND component_name = 'VideoIntroSection';
    `);
  }
} 