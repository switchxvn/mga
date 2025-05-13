import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHeroSliderAdminMenuItem1745000000019 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO admin_menu_items (code, name, icon, path, "order", is_active, created_at, updated_at)
      VALUES ('hero-slider', 'Hero Slider', 'mdi-image', '/admin/hero-slider', 101, true, NOW(), NOW())
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM admin_menu_items WHERE code = 'hero-slider'
    `);
  }
} 