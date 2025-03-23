import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCustomerLogosSectionTextColors1742637124952 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First get the current settings
    const result = await queryRunner.query(`
      SELECT settings FROM theme_sections 
      WHERE type = 'customer_logos' 
      AND component_name = 'CustomerLogosSection'
      LIMIT 1;
    `);

    if (result && result[0]) {
      const currentSettings = result[0].settings;
      const updatedSettings = {
        ...currentSettings,
        colors: {
          ...currentSettings.colors,
          title: "text-gray-900 dark:text-white",
          text: "text-gray-600 dark:text-gray-300",
          primary: "text-primary-600 dark:text-primary-400",
          secondary: "text-gray-500 dark:text-gray-400",
          accent: "text-accent-600 dark:text-accent-400"
        }
      };

      // Update with new settings
      await queryRunner.query(`
        UPDATE theme_sections 
        SET settings = $1::jsonb
        WHERE type = 'customer_logos'
        AND component_name = 'CustomerLogosSection';
      `, [JSON.stringify(updatedSettings)]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // First get the current settings
    const result = await queryRunner.query(`
      SELECT settings FROM theme_sections 
      WHERE type = 'customer_logos' 
      AND component_name = 'CustomerLogosSection'
      LIMIT 1;
    `);

    if (result && result[0]) {
      const currentSettings = result[0].settings;
      const updatedSettings = {
        ...currentSettings,
        colors: {
          title: "text-gray-900 dark:text-white"
        }
      };

      // Revert to original settings
      await queryRunner.query(`
        UPDATE theme_sections 
        SET settings = $1::jsonb
        WHERE type = 'customer_logos'
        AND component_name = 'CustomerLogosSection';
      `, [JSON.stringify(updatedSettings)]);
    }
  }
} 