import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePageTypeToVarchar1745000000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Lấy danh sách các giá trị enum hiện tại
    const enumValues = await queryRunner.query(`
      SELECT pg_enum.enumlabel
      FROM pg_type
      JOIN pg_enum ON pg_enum.enumtypid = pg_type.oid
      WHERE pg_type.typname = 'theme_sections_page_type_enum'
      ORDER BY pg_enum.enumsortorder;
    `);

    // Tạo một cột mới kiểu varchar
    await queryRunner.query(`
      ALTER TABLE theme_sections
      ADD COLUMN page_type_new varchar(50) NOT NULL DEFAULT 'home_page'
    `);

    // Cập nhật giá trị sang cột mới
    await queryRunner.query(`
      UPDATE theme_sections
      SET page_type_new = page_type::text
    `);

    // Xóa cột cũ
    await queryRunner.query(`
      ALTER TABLE theme_sections
      DROP COLUMN page_type
    `);

    // Đổi tên cột mới thành cột cũ
    await queryRunner.query(`
      ALTER TABLE theme_sections
      RENAME COLUMN page_type_new TO page_type
    `);

    // Xóa enum type nếu không còn bảng nào sử dụng
    await queryRunner.query(`
      DROP TYPE IF EXISTS theme_sections_page_type_enum
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Tạo lại enum type
    await queryRunner.query(`
      CREATE TYPE theme_sections_page_type_enum AS ENUM (
        'home_page',
        'news_page',
        'product_page',
        'about_page',
        'service_page',
        'contact_page',
        'common'
      )
    `);

    // Tạo cột mới kiểu enum
    await queryRunner.query(`
      ALTER TABLE theme_sections
      ADD COLUMN page_type_enum theme_sections_page_type_enum
    `);

    // Cập nhật giá trị cho cột enum
    await queryRunner.query(`
      UPDATE theme_sections
      SET page_type_enum = page_type::theme_sections_page_type_enum
    `);

    // Xóa cột varchar
    await queryRunner.query(`
      ALTER TABLE theme_sections
      DROP COLUMN page_type
    `);

    // Đổi tên cột enum
    await queryRunner.query(`
      ALTER TABLE theme_sections
      RENAME COLUMN page_type_enum TO page_type
    `);
  }
} 