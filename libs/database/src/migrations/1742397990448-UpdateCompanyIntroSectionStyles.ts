import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCompanyIntroSectionStyles1742397990448 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get active theme id
    const activeTheme = await queryRunner.query(`
      SELECT id FROM themes WHERE is_active = true LIMIT 1
    `);

    if (!activeTheme || activeTheme.length === 0) {
      throw new Error('No active theme found');
    }

    const themeId = activeTheme[0].id;

    // Update company intro section settings by merging new settings
    await queryRunner.query(`
      UPDATE theme_sections 
      SET settings = settings || 
        '{
          "border": {
            "width": "1px",
            "style": "solid",
            "color": "var(--border-color)",
            "radius": "0.5rem"
          },
          "buttonStyle": {
            "padding": "1rem 2rem",
            "fontSize": "1.125rem",
            "fontWeight": "600"
          }
        }'::jsonb
      WHERE theme_id = ${themeId}
      AND type = 'company_intro'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Get active theme id
    const activeTheme = await queryRunner.query(`
      SELECT id FROM themes WHERE is_active = true LIMIT 1
    `);

    if (!activeTheme || activeTheme.length === 0) {
      throw new Error('No active theme found');
    }

    const themeId = activeTheme[0].id;

    // Remove border and buttonStyle settings while preserving other settings
    await queryRunner.query(`
      UPDATE theme_sections 
      SET settings = settings - 'border' - 'buttonStyle'
      WHERE theme_id = ${themeId}
      AND type = 'company_intro'
    `);
  }
} 