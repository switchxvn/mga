import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveHasMegaMenuColumn1742637124955 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if has_mega_menu column exists before dropping it
    const hasColumn = await queryRunner.hasColumn('menu_items', 'has_mega_menu');
    if (hasColumn) {
      await queryRunner.query(`
        ALTER TABLE menu_items
        DROP COLUMN has_mega_menu;
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Check if has_mega_menu column doesn't exist before adding it back
    const hasColumn = await queryRunner.hasColumn('menu_items', 'has_mega_menu');
    if (!hasColumn) {
      await queryRunner.query(`
        ALTER TABLE menu_items
        ADD COLUMN has_mega_menu boolean DEFAULT false;
      `);
    }
  }
} 