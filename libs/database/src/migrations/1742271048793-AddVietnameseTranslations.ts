import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVietnameseTranslations1742271048793 implements MigrationInterface {
    name = 'AddVietnameseTranslations1742271048793'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add Vietnamese translations
        await queryRunner.query(`
            INSERT INTO menu_item_translations (menu_item_id, locale, label, created_at, updated_at)
            VALUES 
                (1, 'vi', 'Trang chủ', NOW(), NOW()),
                (2, 'vi', 'Sản phẩm', NOW(), NOW()),
                (3, 'vi', 'Bài viết', NOW(), NOW()),
                (4, 'vi', 'Giới thiệu', NOW(), NOW()),
                (5, 'vi', 'Liên hệ', NOW(), NOW());
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove Vietnamese translations
        await queryRunner.query(`
            DELETE FROM menu_item_translations 
            WHERE locale = 'vi' AND menu_item_id IN (1, 2, 3, 4, 5);
        `);
    }
} 