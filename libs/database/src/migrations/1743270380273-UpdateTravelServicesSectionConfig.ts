import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTravelServicesSectionConfig1743270380273 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const existingSection = await queryRunner.query(
      `SELECT id, settings FROM theme_sections WHERE type = 'travel_services' LIMIT 1`
    );

    if (existingSection && existingSection.length > 0) {
      const section = existingSection[0];
      const currentSettings = section.settings;

      const updatedSettings = {
        ...currentSettings,
        maxItems: 8,
        columns: 4,
        layout: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8'
      };

      await queryRunner.query(
        `UPDATE theme_sections SET settings = $1 WHERE id = $2`,
        [JSON.stringify(updatedSettings), section.id]
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const existingSection = await queryRunner.query(
      `SELECT id, settings FROM theme_sections WHERE type = 'travel_services' LIMIT 1`
    );

    if (existingSection && existingSection.length > 0) {
      const section = existingSection[0];
      const currentSettings = section.settings;

      const updatedSettings = {
        ...currentSettings,
        maxItems: 6,
        columns: 3,
        layout: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8'
      };

      await queryRunner.query(
        `UPDATE theme_sections SET settings = $1 WHERE id = $2`,
        [JSON.stringify(updatedSettings), section.id]
      );
    }
  }
} 