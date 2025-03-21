import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNavbarWithoutLogoSettings1742569144099 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update settings for NavbarWithoutLogo component
    await queryRunner.query(`
      UPDATE theme_sections 
      SET settings = jsonb_set(
        settings,
        '{showHotline}',
        'false'::jsonb
      )
      WHERE component_name = 'NavbarWithoutLogo';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert settings for NavbarWithoutLogo component
    await queryRunner.query(`
      UPDATE theme_sections 
      SET settings = jsonb_set(
        settings,
        '{showHotline}',
        'true'::jsonb
      )
      WHERE component_name = 'NavbarWithoutLogo';
    `);
  }
} 