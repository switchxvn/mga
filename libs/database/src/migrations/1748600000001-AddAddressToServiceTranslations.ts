import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAddressToServiceTranslations1748600000001 implements MigrationInterface {
  name = 'AddAddressToServiceTranslations1748600000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "service_translations"
      ADD COLUMN IF NOT EXISTS "address" text
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "service_translations"
      DROP COLUMN IF EXISTS "address"
    `);
  }
}
