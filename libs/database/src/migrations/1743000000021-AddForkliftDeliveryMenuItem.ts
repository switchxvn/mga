import { MigrationInterface, QueryRunner } from "typeorm";

export class AddForkliftDeliveryMenuItem1743000000021 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert menu item
        const menuItemResult = await queryRunner.query(`
            INSERT INTO menu_items (default_locale, icon, "order", level, is_active)
            VALUES ('vi', 'Truck', 9, 0, true)
            RETURNING id;
        `);
        const menuItemId = menuItemResult[0].id;

        // Insert Vietnamese translation
        await queryRunner.query(`
            INSERT INTO menu_item_translations (label, href, locale, menu_item_id)
            VALUES ('Bàn giao xe nâng', 'bai-viet?danh-muc=ban-giao-xe-nang', 'vi', $1)
        `, [menuItemId]);

        // Insert English translation
        await queryRunner.query(`
            INSERT INTO menu_item_translations (label, href, locale, menu_item_id)
            VALUES ('Forklift Delivery', 'bai-viet?danh-muc=ban-giao-xe-nang', 'en', $1)
        `, [menuItemId]);

        // Insert Korean translation
        await queryRunner.query(`
            INSERT INTO menu_item_translations (label, href, locale, menu_item_id)
            VALUES ('지게차 배송', 'bai-viet?danh-muc=ban-giao-xe-nang', 'ko', $1)
        `, [menuItemId]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM menu_items 
            WHERE icon = 'Truck' AND "order" = 9 AND level = 0;
        `);
    }
} 