import { MigrationInterface, QueryRunner } from "typeorm";

export class AddElectricForkliftSubtitlesAndUpdateChildren1743000000015 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Get the menu item id for '/danh-muc-san-pham/xe-nang-dien'
        const result = await queryRunner.query(`
            SELECT menu_item_id 
            FROM menu_item_translations 
            WHERE href = '/danh-muc-san-pham/xe-nang-dien'
            LIMIT 1
        `);
        
        const originalMenuId = result[0]?.menu_item_id;
        
        if (!originalMenuId) {
            throw new Error("Menu item with href '/danh-muc-san-pham/xe-nang-dien' not found");
        }

        // 2. Create first subtitle "Xe nâng điện đứng lái"
        const standingForkliftResult = await queryRunner.query(`
            INSERT INTO menu_items (default_locale, level, "order", is_active, parent_id)
            VALUES ('vi', 1, 0, true, $1)
            RETURNING id
        `, [originalMenuId]);
        
        const standingForkliftId = standingForkliftResult[0].id;
        
        // Add translations for standing forklift menu
        await queryRunner.query(`
            INSERT INTO menu_item_translations (menu_item_id, locale, label, href)
            VALUES 
            ($1, 'vi', 'Xe nâng điện đứng lái', '/danh-muc-san-pham/xe-nang-dien/dung-lai'),
            ($1, 'en', 'Standing Electric Forklift', '/categories/electric-forklift/standing')
        `, [standingForkliftId]);

        // 3. Create second subtitle "Xe nâng điện ngồi lái"
        const sittingForkliftResult = await queryRunner.query(`
            INSERT INTO menu_items (default_locale, level, "order", is_active, parent_id)
            VALUES ('vi', 1, 1, true, $1)
            RETURNING id
        `, [originalMenuId]);
        
        const sittingForkliftId = sittingForkliftResult[0].id;
        
        // Add translations for sitting forklift menu
        await queryRunner.query(`
            INSERT INTO menu_item_translations (menu_item_id, locale, label, href)
            VALUES 
            ($1, 'vi', 'Xe nâng điện ngồi lái', '/danh-muc-san-pham/xe-nang-dien/ngoi-lai'),
            ($1, 'en', 'Sitting Electric Forklift', '/categories/electric-forklift/sitting')
        `, [sittingForkliftId]);

        // 4. Update all child menus to point to the standing forklift menu and set their level to 2
        await queryRunner.query(`
            UPDATE menu_items
            SET parent_id = $1, level = 2
            WHERE parent_id = $2
        `, [standingForkliftId, originalMenuId]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. Get the original electric forklift menu ID
        const originalMenu = await queryRunner.query(`
            SELECT menu_item_id 
            FROM menu_item_translations 
            WHERE href = '/danh-muc-san-pham/xe-nang-dien'
            LIMIT 1
        `);
        
        if (!originalMenu[0]?.menu_item_id) {
            return;
        }

        const originalMenuId = originalMenu[0].menu_item_id;

        // 2. Get the standing and sitting forklift menu IDs
        const subtitles = await queryRunner.query(`
            SELECT mi.id, mt.href
            FROM menu_items mi
            JOIN menu_item_translations mt ON mi.id = mt.menu_item_id
            WHERE mt.href IN (
                '/danh-muc-san-pham/xe-nang-dien/dung-lai',
                '/danh-muc-san-pham/xe-nang-dien/ngoi-lai'
            )
        `);

        const standingForkliftId = subtitles.find(m => m.href === '/danh-muc-san-pham/xe-nang-dien/dung-lai')?.id;

        if (standingForkliftId) {
            // 3. Move all children back to original parent
            await queryRunner.query(`
                UPDATE menu_items
                SET parent_id = $1, level = 1
                WHERE parent_id = $2
            `, [originalMenuId, standingForkliftId]);
        }

        // 4. Delete both subtitle menu items (cascade will handle translations)
        await queryRunner.query(`
            DELETE FROM menu_items
            WHERE id IN (
                SELECT mi.id
                FROM menu_items mi
                JOIN menu_item_translations mt ON mi.id = mt.menu_item_id
                WHERE mt.href IN (
                    '/danh-muc-san-pham/xe-nang-dien/dung-lai',
                    '/danh-muc-san-pham/xe-nang-dien/ngoi-lai'
                )
            )
        `);
    }
} 