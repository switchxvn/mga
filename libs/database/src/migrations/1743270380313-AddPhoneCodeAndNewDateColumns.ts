import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneCodeAndNewDateColumns1743270380313 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Thêm cột requester_phone_code vào bảng order_refunds
    await queryRunner.query(`
      ALTER TABLE "order_refunds"
      ADD COLUMN IF NOT EXISTS "requester_phone_code" VARCHAR(10)
    `);

    // Thêm cột new_date vào bảng order_refund_items
    await queryRunner.query(`
      ALTER TABLE "order_refund_items"
      ADD COLUMN IF NOT EXISTS "new_date" DATE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa cột new_date từ bảng order_refund_items
    await queryRunner.query(`
      ALTER TABLE "order_refund_items"
      DROP COLUMN IF EXISTS "new_date"
    `);

    // Xóa cột requester_phone_code từ bảng order_refunds
    await queryRunner.query(`
      ALTER TABLE "order_refunds"
      DROP COLUMN IF EXISTS "requester_phone_code"
    `);
  }
} 