import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCompanyIntroButtonColors1742637124946 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        jsonb_set(
          settings,
          '{buttonStyle}',
          settings->'buttonStyle' || '{"backgroundColor": "var(--tertiary-500)", "textColor": "#ffffff"}'::jsonb
        ),
        '{darkMode,buttonStyle}',
        '{"backgroundColor": "var(--tertiary-500)", "textColor": "#ffffff"}'::jsonb
      )
      WHERE component_name = 'CompanyIntroSection'
      AND settings->>'layout' = 'full-text'
      AND settings->>'description' LIKE '%GIỚI THIỆU MGA VIỆT NAM%';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        jsonb_set(
          settings,
          '{buttonStyle}',
          (settings->'buttonStyle' - 'backgroundColor' - 'textColor')
        ),
        '{darkMode}',
        (settings->'darkMode' - 'buttonStyle')
      )
      WHERE component_name = 'CompanyIntroSection'
      AND settings->>'layout' = 'full-text'
      AND settings->>'description' LIKE '%GIỚI THIỆU MGA VIỆT NAM%';
    `);
  }
} 