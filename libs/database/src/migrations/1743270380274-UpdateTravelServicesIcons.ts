import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTravelServicesIcons1743270380274 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const existingSection = await queryRunner.query(
      `SELECT id, settings FROM theme_sections WHERE type = 'travel_services' LIMIT 1`
    );

    if (existingSection && existingSection.length > 0) {
      const section = existingSection[0];
      const currentSettings = section.settings;

      // Map old services to new ones with Lucide icons
      const updatedServices = (currentSettings.services || []).map(service => {
        const iconMap: Record<string, string> = {
          'i-heroicons-truck': 'Truck',
          'i-heroicons-building-office-2': 'Building2',
          'i-heroicons-bed': 'Bed',
          'i-heroicons-bike': 'Bike',
          'i-heroicons-car': 'Car',
          'i-heroicons-bus': 'Bus',
          'i-heroicons-battery-charging': 'BatteryCharging',
          'i-heroicons-lightning-bolt': 'Zap'
        };

        return {
          ...service,
          icon: iconMap[service.icon] || service.icon
        };
      });

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

  public async down(queryRunner: QueryRunner): Promise<void> {
    const existingSection = await queryRunner.query(
      `SELECT id, settings FROM theme_sections WHERE type = 'travel_services' LIMIT 1`
    );

    if (existingSection && existingSection.length > 0) {
      const section = existingSection[0];
      const currentSettings = section.settings;

      // Map back to heroicons
      const updatedServices = (currentSettings.services || []).map(service => {
        const iconMap: Record<string, string> = {
          'Truck': 'i-heroicons-truck',
          'Building2': 'i-heroicons-building-office-2',
          'Bed': 'i-heroicons-bed',
          'Bike': 'i-heroicons-bike',
          'Car': 'i-heroicons-car',
          'Bus': 'i-heroicons-bus',
          'BatteryCharging': 'i-heroicons-battery-charging',
          'Zap': 'i-heroicons-lightning-bolt'
        };

        return {
          ...service,
          icon: iconMap[service.icon] || service.icon
        };
      });

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