import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCombinedNavbarDarkMode1742571593306 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        settings,
        '{darkMode}',
        '{
          "headerBackgroundColor": "#feb912",
          "menuBackgroundColor": "#171717",
          "textColor": "#ffffff",
          "borderColor": "#404040"
        }'::jsonb,
        true
      )
      WHERE component_name = 'CombinedNavbar'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = settings - 'darkMode'
      WHERE component_name = 'CombinedNavbar'
    `);
  }
} 