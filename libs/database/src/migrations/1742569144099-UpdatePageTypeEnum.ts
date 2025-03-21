import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePageTypeEnum1742569144099 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Start a new transaction
    await queryRunner.query('BEGIN;');
    
    // Add 'common' to the page_type enum
    await queryRunner.query(`
      ALTER TYPE theme_sections_page_type_enum ADD VALUE IF NOT EXISTS 'common';
    `);
    
    // Commit the transaction to make the new enum value available
    await queryRunner.query('COMMIT;');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Cannot remove enum value in PostgreSQL, need to create a new type
    // This is a complex operation and might cause data loss
    // So we'll leave it as is in the down migration
  }
} 