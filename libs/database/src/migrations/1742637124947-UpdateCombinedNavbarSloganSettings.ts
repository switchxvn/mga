import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCombinedNavbarSloganSettings1742637124947 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update existing combined_navbar sections
    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        settings,
        '{slogan}',
        '{"text": "XE NÂNG MGA FORKLIFT LẮP RÁP SKD TẠI VIỆT NAM", "subText": "ĐỘNG CƠ ISUZU NHẬP KHẨU NỘI ĐỊA TỪ NHẬT BẢN", "additionalText": "BÁN VÀ CHO THUÊ GIÁ TỐT NHẤT", "fontSize": "lg", "fontWeight": "bold"}'::jsonb
      )
      WHERE type = 'combined_navbar'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back to original slogan settings
    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        settings,
        '{slogan}',
        '{"text": "XE NÂNG MGA FORKLIFT LẮP RÁP SKD TẠI VIỆT NAM", "subText": "ĐỘNG CƠ ISUZU NHẬP KHẨU NỘI ĐỊA TỪ NHẬT BẢN", "fontSize": "lg", "fontWeight": "bold"}'::jsonb
      )
      WHERE type = 'combined_navbar'
    `);
  }
} 