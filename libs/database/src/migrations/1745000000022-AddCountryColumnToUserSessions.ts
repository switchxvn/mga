import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCountryColumnToUserSessions1745000000022 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_sessions" 
      ADD COLUMN IF NOT EXISTS "country" varchar NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_sessions" 
      DROP COLUMN IF EXISTS "country"
    `);
  }
} 