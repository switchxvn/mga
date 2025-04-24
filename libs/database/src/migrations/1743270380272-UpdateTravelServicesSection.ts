import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTravelServicesSection1743270380272 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const existingSection = await queryRunner.query(
      `SELECT id, settings FROM theme_sections WHERE type = 'travel_services' LIMIT 1`
    );

    if (existingSection && existingSection.length > 0) {
      const section = existingSection[0];
      const currentSettings = section.settings;

      const newServices = [
        {
          title: 'Hệ thống cáp treo dài 900m với 37 cabin hiện đại',
          description: 'Trải nghiệm hệ thống cáp treo hiện đại với 37 cabin.',
          icon: 'i-heroicons-truck',
          link: '/services/cable-car'
        },
        {
          title: 'Nhà ga cáp treo rộng rãi với bãi đậu xe cho hơn 2.000 xe ô tô',
          description: 'Nhà ga cáp treo rộng rãi với bãi đậu xe lớn.',
          icon: 'i-heroicons-building-office-2',
          link: '/services/cable-car-station'
        }
      ];

      const updatedSettings = {
        ...currentSettings,
        services: [...(currentSettings.services || []), ...newServices]
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
      const updatedServices = (currentSettings.services || []).slice(0, -2);

      const updatedSettings = {
        ...currentSettings,
        services: updatedServices
      };

      await queryRunner.query(
        `UPDATE theme_sections SET settings = $1 WHERE id = $2`,
        [JSON.stringify(updatedSettings), section.id]
      );
    }
  }
} 