import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveHasMegaMenuColumn1742637124955 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop has_mega_menu column from menu_items
    await queryRunner.query(`
      ALTER TABLE menu_items
      DROP COLUMN has_mega_menu;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add has_mega_menu column back to menu_items
    await queryRunner.query(`
      ALTER TABLE menu_items
      ADD COLUMN has_mega_menu boolean DEFAULT false;
    `);
  }
} 