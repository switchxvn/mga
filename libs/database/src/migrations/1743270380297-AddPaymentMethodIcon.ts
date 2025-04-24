import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentMethodIcon1743270380297 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "payment_methods"
      ADD COLUMN IF NOT EXISTS "icon" VARCHAR;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "payment_methods"
      DROP COLUMN IF EXISTS "icon";
    `);
  }
} 