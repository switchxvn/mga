import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRecruitmentMenuItem1743000000023 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert parent menu item
        await queryRunner.query(`
            INSERT INTO menu_items (default_locale, icon, "order", level, is_active, parent_id)
            VALUES ('vi', NULL, 100, 0, true, NULL)
            RETURNING id;
        `).then(async (result) => {
            const menuItemId = result[0].id;

            // Insert translations for the menu item
            await queryRunner.query(`
                INSERT INTO menu_item_translations (label, href, locale, menu_item_id)
                VALUES 
                    ('Tuyển dụng', '/bai-viet?danh-muc=tuyen-dung', 'vi', $1),
                    ('Recruitment', '/bai-viet?danh-muc=tuyen-dung', 'en', $1)
            `, [menuItemId]);
        });
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Find and delete the menu item (cascade will handle translations)
        await queryRunner.query(`
            DELETE FROM menu_items 
            WHERE default_locale = 'vi' 
            AND level = 0 
            AND parent_id IS NULL
            AND EXISTS (
                SELECT 1 FROM menu_item_translations 
                WHERE menu_item_id = menu_items.id 
                AND label = 'Tuyển dụng'
                AND locale = 'vi'
            )
        `);
    }
} 