import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewsSection1742524281160 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First get the active theme id
    const activeTheme = await queryRunner.query(`
      SELECT id FROM themes WHERE is_active = true LIMIT 1;
    `);

    if (!activeTheme || activeTheme.length === 0) {
      throw new Error('No active theme found. Please ensure there is an active theme before running this migration.');
    }

    const themeId = activeTheme[0].id;

    // Check if news section already exists
    const existingSection = await queryRunner.query(`
      SELECT id FROM theme_sections WHERE type = 'news' LIMIT 1;
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
          'news',
          'Tin tức mới nhất',
          7,
          '{
            "gap": "1rem",
            "layout": "grid",
            "columns": 3,
            "padding": {
              "top": "2rem",
              "bottom": "2rem"
            },
            "maxItems": 6,
            "showDate": true,
            "buttonText": "Xem thêm",
            "showAuthor": true,
            "buttonStyle": "primary",
            "showExcerpt": true,
            "excerptLength": 120,
            "overlayOpacity": "0.5",
            "imageAspectRatio": "16/9",
            "backgroundGradient": {
              "to": "rgba(0,0,0,0)",
              "from": "rgba(0,0,0,0.7)",
              "direction": "to-t"
            }
          }',
          true,
          ${themeId},
          'NewsSection'
        );
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM theme_sections 
      WHERE type = 'news' 
      AND component_name = 'NewsSection';
    `);
  }
} 