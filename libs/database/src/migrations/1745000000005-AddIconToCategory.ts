import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIconToCategory1745000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Thêm cột icon vào bảng categories để lưu tên icon từ Lucide
    await queryRunner.query(`
      ALTER TABLE "categories"
      ADD COLUMN "icon" varchar(50) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa cột icon nếu rollback
    await queryRunner.query(`
      ALTER TABLE "categories"
      DROP COLUMN "icon"
    `);
  }
} 