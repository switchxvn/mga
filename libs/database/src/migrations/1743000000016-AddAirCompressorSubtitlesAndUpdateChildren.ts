import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAirCompressorSubtitlesAndUpdateChildren1743000000016 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Get the menu item id for '/danh-muc-san-pham/may-nen-khi'
        const result = await queryRunner.query(`
            SELECT menu_item_id 
            FROM menu_item_translations 
            WHERE href = '/danh-muc-san-pham/may-nen-khi'
            LIMIT 1
        `);
        
        const originalMenuId = result[0]?.menu_item_id;
        
        if (!originalMenuId) {
            throw new Error("Menu item with href '/danh-muc-san-pham/may-nen-khi' not found");
        }

        // 2. Create first subtitle "Máy nén khí trục vít"
        const screwCompressorResult = await queryRunner.query(`
            INSERT INTO menu_items (default_locale, level, "order", is_active, parent_id)
            VALUES ('vi', 1, 0, true, $1)
            RETURNING id
        `, [originalMenuId]);
        
        const screwCompressorId = screwCompressorResult[0].id;
        
        // Add translations for screw compressor menu
        await queryRunner.query(`
            INSERT INTO menu_item_translations (menu_item_id, locale, label, href)
            VALUES 
            ($1, 'vi', 'Máy nén khí trục vít', '/danh-muc-san-pham/may-nen-khi/truc-vit'),
            ($1, 'en', 'Screw Air Compressor', '/categories/air-compressor/screw')
        `, [screwCompressorId]);

        // 3. Create second subtitle "Máy nén khí piston"
        const pistonCompressorResult = await queryRunner.query(`
            INSERT INTO menu_items (default_locale, level, "order", is_active, parent_id)
            VALUES ('vi', 1, 1, true, $1)
            RETURNING id
        `, [originalMenuId]);
        
        const pistonCompressorId = pistonCompressorResult[0].id;
        
        // Add translations for piston compressor menu
        await queryRunner.query(`
            INSERT INTO menu_item_translations (menu_item_id, locale, label, href)
            VALUES 
            ($1, 'vi', 'Máy nén khí piston', '/danh-muc-san-pham/may-nen-khi/piston'),
            ($1, 'en', 'Piston Air Compressor', '/categories/air-compressor/piston')
        `, [pistonCompressorId]);

        // 4. Update all child menus to point to the screw compressor menu and set their level to 2
        await queryRunner.query(`
            UPDATE menu_items
            SET parent_id = $1, level = 2
            WHERE parent_id = $2
        `, [screwCompressorId, originalMenuId]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. Get the original air compressor menu ID
        const originalMenu = await queryRunner.query(`
            SELECT menu_item_id 
            FROM menu_item_translations 
            WHERE href = '/danh-muc-san-pham/may-nen-khi'
            LIMIT 1
        `);
        
        if (!originalMenu[0]?.menu_item_id) {
            return;
        }

        const originalMenuId = originalMenu[0].menu_item_id;

        // 2. Get the screw and piston compressor menu IDs
        const subtitles = await queryRunner.query(`
            SELECT mi.id, mt.href
            FROM menu_items mi
            JOIN menu_item_translations mt ON mi.id = mt.menu_item_id
            WHERE mt.href IN (
                '/danh-muc-san-pham/may-nen-khi/truc-vit',
                '/danh-muc-san-pham/may-nen-khi/piston'
            )
        `);

        const screwCompressorId = subtitles.find(m => m.href === '/danh-muc-san-pham/may-nen-khi/truc-vit')?.id;

        if (screwCompressorId) {
            // 3. Move all children back to original parent
            await queryRunner.query(`
                UPDATE menu_items
                SET parent_id = $1, level = 1
                WHERE parent_id = $2
            `, [originalMenuId, screwCompressorId]);
        }

        // 4. Delete both subtitle menu items (cascade will handle translations)
        await queryRunner.query(`
            DELETE FROM menu_items
            WHERE id IN (
                SELECT mi.id
                FROM menu_items mi
                JOIN menu_item_translations mt ON mi.id = mt.menu_item_id
                WHERE mt.href IN (
                    '/danh-muc-san-pham/may-nen-khi/truc-vit',
                    '/danh-muc-san-pham/may-nen-khi/piston'
                )
            )
        `);
    }
} 