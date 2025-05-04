import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGalleryToCategoryType1745000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Kiểm tra xem giá trị 'gallery' đã tồn tại trong enum chưa
    const enumValues = await queryRunner.query(`
      SELECT e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'categories_category_type_enum'
    `);
    
    // Nếu chưa có giá trị 'gallery', thêm vào
    const hasGalleryValue = enumValues.some((row: any) => row.enumlabel === 'gallery');
    
    if (!hasGalleryValue) {
      await queryRunner.query(`
        ALTER TYPE "categories_category_type_enum" ADD VALUE 'gallery';
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Không thể xóa trực tiếp giá trị từ enum trong PostgreSQL
    // Trong trường hợp xấu nhất có thể phải tạo kiểu enum mới không có giá trị 'gallery'
    // và cập nhật cột để sử dụng kiểu mới - quá trình phức tạp
    // Nhưng thường không cần rollback nên để trống
  }
} 