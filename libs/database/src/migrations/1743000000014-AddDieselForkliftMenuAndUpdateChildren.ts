import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDieselForkliftMenuAndUpdateChildren1743000000014 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Get the menu item id for '/danh-muc-san-pham/xe-nang-dau'
        const result = await queryRunner.query(`
            SELECT menu_item_id 
            FROM menu_item_translations 
            WHERE href = '/danh-muc-san-pham/xe-nang-dau'
            LIMIT 1
        `);
        
        const originalMenuId = result[0]?.menu_item_id;
        
        if (!originalMenuId) {
            throw new Error("Menu item with href '/danh-muc-san-pham/xe-nang-dau' not found");
        }

        // 2. Create new menu item "Xe nâng dầu" with level 1 and parent_id
        await queryRunner.query(`
            INSERT INTO menu_items (default_locale, level, "order", is_active, parent_id)
            VALUES ('vi', 1, 0, true, $1)
            RETURNING id
        `, [originalMenuId]).then(async (result) => {
            const newMenuId = result[0].id;
            
            // Add translations for the new menu
            await queryRunner.query(`
                INSERT INTO menu_item_translations (menu_item_id, locale, label, href)
                VALUES 
                ($1, 'vi', 'Xe nâng dầu', '/danh-muc-san-pham/xe-nang-dau'),
                ($1, 'en', 'Diesel Forklift', '/categories/diesel-forklift')
            `, [newMenuId]);

            // 3. Update all child menus to point to the new menu and set their level to 2
            await queryRunner.query(`
                UPDATE menu_items
                SET parent_id = $1, level = 2
                WHERE parent_id = $2
            `, [newMenuId, originalMenuId]);
        });
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. First, get the IDs of both menus
        const newMenu = await queryRunner.query(`
            SELECT mi.id as new_menu_id, (
                SELECT m2.id 
                FROM menu_items m2
                JOIN menu_item_translations mt2 ON m2.id = mt2.menu_item_id
                WHERE mt2.href = '/danh-muc-san-pham/xe-nang-dau'
                AND m2.id != mi.id
                LIMIT 1
            ) as original_menu_id
            FROM menu_items mi
            JOIN menu_item_translations mt ON mi.id = mt.menu_item_id
            WHERE mt.href = '/danh-muc-san-pham/xe-nang-dau'
            AND mi.level = 1
            LIMIT 1
        `);

        if (newMenu[0]) {
            const { new_menu_id, original_menu_id } = newMenu[0];

            // 2. Update children back to original parent and level
            await queryRunner.query(`
                UPDATE menu_items
                SET parent_id = $1, level = 1
                WHERE parent_id = $2
            `, [original_menu_id, new_menu_id]);

            // 3. Delete the new menu item (cascade will handle translations)
            await queryRunner.query(`
                DELETE FROM menu_items
                WHERE id = $1
            `, [new_menu_id]);
        }
    }
} 