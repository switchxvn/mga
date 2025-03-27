import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGeneratorSubtitlesAndUpdateChildren1743000000017 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Get the menu item id for '/danh-muc-san-pham/may-phat-dien'
        const result = await queryRunner.query(`
            SELECT menu_item_id 
            FROM menu_item_translations 
            WHERE href = '/danh-muc-san-pham/may-phat-dien'
            LIMIT 1
        `);
        
        const originalMenuId = result[0]?.menu_item_id;
        
        if (!originalMenuId) {
            throw new Error("Menu item with href '/danh-muc-san-pham/may-phat-dien' not found");
        }

        // 2. Create first subtitle "Máy phát điện Diesel"
        const dieselGeneratorResult = await queryRunner.query(`
            INSERT INTO menu_items (default_locale, level, "order", is_active, parent_id)
            VALUES ('vi', 1, 0, true, $1)
            RETURNING id
        `, [originalMenuId]);
        
        const dieselGeneratorId = dieselGeneratorResult[0].id;
        
        // Add translations for diesel generator menu
        await queryRunner.query(`
            INSERT INTO menu_item_translations (menu_item_id, locale, label, href)
            VALUES 
            ($1, 'vi', 'Máy phát điện Diesel', '/danh-muc-san-pham/may-phat-dien/diesel'),
            ($1, 'en', 'Diesel Generator', '/categories/generator/diesel')
        `, [dieselGeneratorId]);

        // 3. Create second subtitle "Máy phát điện Gas"
        const gasGeneratorResult = await queryRunner.query(`
            INSERT INTO menu_items (default_locale, level, "order", is_active, parent_id)
            VALUES ('vi', 1, 1, true, $1)
            RETURNING id
        `, [originalMenuId]);
        
        const gasGeneratorId = gasGeneratorResult[0].id;
        
        // Add translations for gas generator menu
        await queryRunner.query(`
            INSERT INTO menu_item_translations (menu_item_id, locale, label, href)
            VALUES 
            ($1, 'vi', 'Máy phát điện Gas', '/danh-muc-san-pham/may-phat-dien/gas'),
            ($1, 'en', 'Gas Generator', '/categories/generator/gas')
        `, [gasGeneratorId]);

        // 4. Update all child menus to point to the diesel generator menu and set their level to 2
        await queryRunner.query(`
            UPDATE menu_items
            SET parent_id = $1, level = 2
            WHERE parent_id = $2
        `, [dieselGeneratorId, originalMenuId]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. Get the original generator menu ID
        const originalMenu = await queryRunner.query(`
            SELECT menu_item_id 
            FROM menu_item_translations 
            WHERE href = '/danh-muc-san-pham/may-phat-dien'
            LIMIT 1
        `);
        
        if (!originalMenu[0]?.menu_item_id) {
            return;
        }

        const originalMenuId = originalMenu[0].menu_item_id;

        // 2. Get the diesel and gas generator menu IDs
        const subtitles = await queryRunner.query(`
            SELECT mi.id, mt.href
            FROM menu_items mi
            JOIN menu_item_translations mt ON mi.id = mt.menu_item_id
            WHERE mt.href IN (
                '/danh-muc-san-pham/may-phat-dien/diesel',
                '/danh-muc-san-pham/may-phat-dien/gas'
            )
        `);

        const dieselGeneratorId = subtitles.find(m => m.href === '/danh-muc-san-pham/may-phat-dien/diesel')?.id;

        if (dieselGeneratorId) {
            // 3. Move all children back to original parent
            await queryRunner.query(`
                UPDATE menu_items
                SET parent_id = $1, level = 1
                WHERE parent_id = $2
            `, [originalMenuId, dieselGeneratorId]);
        }

        // 4. Delete both subtitle menu items (cascade will handle translations)
        await queryRunner.query(`
            DELETE FROM menu_items
            WHERE id IN (
                SELECT mi.id
                FROM menu_items mi
                JOIN menu_item_translations mt ON mi.id = mt.menu_item_id
                WHERE mt.href IN (
                    '/danh-muc-san-pham/may-phat-dien/diesel',
                    '/danh-muc-san-pham/may-phat-dien/gas'
                )
            )
        `);
    }
} 