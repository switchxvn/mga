import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAclColumnToUploads1743270380304 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "uploads"
      ADD COLUMN IF NOT EXISTS "acl" varchar DEFAULT 'public-read'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "uploads"
      DROP COLUMN IF EXISTS "acl"
    `);
  }
} 