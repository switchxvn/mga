import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContactMenuItem1743000000019 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert menu item
        await queryRunner.query(`
            INSERT INTO menu_items (
                default_locale,
                icon,
                "order",
                level,
                is_active,
                parent_id,
                created_at,
                updated_at
            ) VALUES (
                'vi',
                'phone',
                100,
                0,
                true,
                NULL,
                NOW(),
                NOW()
            ) RETURNING id;
        `);

        // Get the inserted menu item id
        const result = await queryRunner.query(`
            SELECT id FROM menu_items WHERE icon = 'phone' AND "order" = 100 LIMIT 1;
        `);
        const menuItemId = result[0].id;

        // Insert Vietnamese translation
        await queryRunner.query(`
            INSERT INTO menu_item_translations (
                menu_item_id,
                locale,
                label,
                href,
                created_at,
                updated_at
            ) VALUES (
                ${menuItemId},
                'vi',
                'Liên hệ',
                'lien-he',
                NOW(),
                NOW()
            );
        `);

        // Insert English translation
        await queryRunner.query(`
            INSERT INTO menu_item_translations (
                menu_item_id,
                locale,
                label,
                href,
                created_at,
                updated_at
            ) VALUES (
                ${menuItemId},
                'en',
                'Contact',
                'contact',
                NOW(),
                NOW()
            );
        `);

        // Insert Korean translation
        await queryRunner.query(`
            INSERT INTO menu_item_translations (
                menu_item_id,
                locale,
                label,
                href,
                created_at,
                updated_at
            ) VALUES (
                ${menuItemId},
                'ko',
                '연락하다',
                'contact',
                NOW(),
                NOW()
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Find and delete the menu item (cascade will remove translations)
        await queryRunner.query(`
            DELETE FROM menu_items 
            WHERE icon = 'phone' AND "order" = 100;
        `);
    }
} 