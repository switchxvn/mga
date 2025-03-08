import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveCartSettingFromSettings1741400695447 implements MigrationInterface {
    name = 'RemoveCartSettingFromSettings1741400695447'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Xóa record enable_add_to_cart khỏi bảng settings
        await queryRunner.query(`DELETE FROM "settings" WHERE "key" = 'enable_add_to_cart'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Thêm lại record enable_add_to_cart vào bảng settings
        await queryRunner.query(`INSERT INTO "settings" ("key", "value", "group", "description", "is_public") 
        VALUES ('enable_add_to_cart', 'true', 'shop', 'Cho phép thêm sản phẩm vào giỏ hàng', true)`);
    }
} 