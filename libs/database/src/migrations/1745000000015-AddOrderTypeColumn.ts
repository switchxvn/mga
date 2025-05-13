import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderTypeColumn1745000000015 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo enum type cho orderType trong database
    await queryRunner.query(`
      CREATE TYPE "order_type_enum" AS ENUM ('standard', 'ticket');
    `);

    // Thêm cột orderType vào bảng orders
    await queryRunner.query(`
      ALTER TABLE "orders" 
      ADD COLUMN "order_type" "order_type_enum" NOT NULL DEFAULT 'standard';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa cột orderType
    await queryRunner.query(`
      ALTER TABLE "orders" 
      DROP COLUMN "order_type";
    `);

    // Xóa enum type
    await queryRunner.query(`
      DROP TYPE "order_type_enum";
    `);
  }
} 