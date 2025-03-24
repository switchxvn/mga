import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveMegaMenuColumns1742637124953 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE menu_items 
      DROP COLUMN IF EXISTS mega_menu_columns,
      DROP COLUMN IF EXISTS label,
      DROP COLUMN IF EXISTS has_mega_menu;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE menu_items 
      ADD COLUMN IF NOT EXISTS mega_menu_columns jsonb,
      ADD COLUMN IF NOT EXISTS label character varying,
      ADD COLUMN IF NOT EXISTS has_mega_menu boolean DEFAULT false;
    `);
  }
} 