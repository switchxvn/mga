import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOrderStatusEnum1745000000011 implements MigrationInterface {
  name = 'UpdateOrderStatusEnum1745000000011'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Xóa giá trị mặc định trước
    await queryRunner.query(`
      ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT
    `);

    // Tạo enum mới với các giá trị từ OrderStatus enum
    await queryRunner.query(`
      ALTER TYPE "orders_status_enum" RENAME TO "orders_status_enum_old"
    `);

    await queryRunner.query(`
      CREATE TYPE "orders_status_enum" AS ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
    `);

    // Chuyển đổi cột status sang kiểu enum mới
    await queryRunner.query(`
      ALTER TABLE "orders" ALTER COLUMN "status" TYPE "orders_status_enum" USING "status"::text::"orders_status_enum"
    `);

    // Thiết lập lại giá trị mặc định
    await queryRunner.query(`
      ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending'
    `);

    // Xóa enum cũ
    await queryRunner.query(`
      DROP TYPE "orders_status_enum_old"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa giá trị mặc định trước
    await queryRunner.query(`
      ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT
    `);

    // Khôi phục enum cũ (lấy giá trị từ CreateOrderTables1743270380294)
    await queryRunner.query(`
      ALTER TYPE "orders_status_enum" RENAME TO "orders_status_enum_new"
    `);

    await queryRunner.query(`
      CREATE TYPE "orders_status_enum" AS ENUM('pending', 'processing', 'completed', 'cancelled')
    `);

    // Chuyển đổi các giá trị mới về giá trị cũ
    await queryRunner.query(`
      ALTER TABLE "orders" ALTER COLUMN "status" TYPE "orders_status_enum" USING 
      CASE 
        WHEN "status"::text = 'confirmed' THEN 'processing'::text
        WHEN "status"::text = 'shipped' THEN 'processing'::text
        WHEN "status"::text = 'delivered' THEN 'completed'::text
        ELSE "status"::text
      END::"orders_status_enum"
    `);

    // Thiết lập lại giá trị mặc định
    await queryRunner.query(`
      ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending'
    `);

    // Xóa enum trung gian
    await queryRunner.query(`
      DROP TYPE "orders_status_enum_new"
    `);
  }
} 