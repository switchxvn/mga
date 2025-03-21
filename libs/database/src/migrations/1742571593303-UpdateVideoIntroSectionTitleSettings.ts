import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateVideoIntroSectionTitleSettings1742571593303 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              settings,
              '{titleStyle}',
              '{"fontSize": "1.125rem", "fontWeight": "600", "color": "#1a1a1a", "hoverColor": "#2563eb", "textDecoration": "none", "hoverTextDecoration": "underline"}'::jsonb
            ),
            '{darkMode}',
            '{"titleColor": "#ffffff", "titleHoverColor": "#60a5fa"}'::jsonb
          ),
          '{linkTarget}',
          '"_blank"'::jsonb
        ),
        '{linkEnabled}',
        'true'::jsonb
      )
      WHERE component_name = 'VideoIntroSection'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = settings - 'titleStyle' - 'darkMode' - 'linkTarget' - 'linkEnabled'
      WHERE component_name = 'VideoIntroSection'
    `);
  }
} 