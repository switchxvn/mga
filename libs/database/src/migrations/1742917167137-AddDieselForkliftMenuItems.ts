import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDieselForkliftMenuItems1742917167137 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, get the parent menu item ID for diesel forklifts
    const parentMenuItemResult = await queryRunner.query(
      `SELECT mit.menu_item_id 
       FROM menu_item_translations mit 
       WHERE mit.href = '/danh-muc-san-pham/xe-nang-dau' 
       LIMIT 1`
    );

    if (!parentMenuItemResult || parentMenuItemResult.length === 0) {
      throw new Error('Parent menu item for diesel forklifts not found');
    }

    const parentMenuItemId = parentMenuItemResult[0].menu_item_id;

    // Array of menu items to insert
    const menuItems = [
      {
        name: 'Xe Nâng Dầu MGA 2.5 Tấn',
        name_en: 'MGA 2.5 Ton Diesel Forklift',
        href: '/san-pham/xe-nang-dau-mga-2-5-tan',
        href_en: '/products/mga-2-5-ton-diesel-forklift',
        order: 1,
      },
      {
        name: 'Xe Nâng Dầu MGA 3.0 Tấn',
        name_en: 'MGA 3.0 Ton Diesel Forklift',
        href: '/san-pham/xe-nang-dau-mga-3-0-tan',
        href_en: '/products/mga-3-0-ton-diesel-forklift',
        order: 2,
      },
      {
        name: 'Xe Nâng Dầu MGA 3.5 Tấn',
        name_en: 'MGA 3.5 Ton Diesel Forklift',
        href: '/san-pham/xe-nang-dau-mga-3-5-tan',
        href_en: '/products/mga-3-5-ton-diesel-forklift',
        order: 3,
      },
      {
        name: 'Xe Nâng Dầu MGA 4.0 Tấn',
        name_en: 'MGA 4.0 Ton Diesel Forklift',
        href: '/san-pham/xe-nang-dau-mga-4-0-tan',
        href_en: '/products/mga-4-0-ton-diesel-forklift',
        order: 4,
      },
      {
        name: 'Xe Nâng Dầu MGA 4.5 Tấn',
        name_en: 'MGA 4.5 Ton Diesel Forklift',
        href: '/san-pham/xe-nang-dau-mga-4-5-tan',
        href_en: '/products/mga-4-5-ton-diesel-forklift',
        order: 5,
      },
      {
        name: 'Xe Nâng Dầu MGA 5.0 Tấn',
        name_en: 'MGA 5.0 Ton Diesel Forklift',
        href: '/san-pham/xe-nang-dau-mga-5-0-tan',
        href_en: '/products/mga-5-0-ton-diesel-forklift',
        order: 6,
      },
      {
        name: 'Xe Nâng Dầu MGA 7.0 Tấn',
        name_en: 'MGA 7.0 Ton Diesel Forklift',
        href: '/san-pham/xe-nang-dau-mga-7-0-tan',
        href_en: '/products/mga-7-0-ton-diesel-forklift',
        order: 7,
      },
      {
        name: 'Xe Nâng Dầu MGA 10 Tấn',
        name_en: 'MGA 10 Ton Diesel Forklift',
        href: '/san-pham/xe-nang-dau-mga-10-tan',
        href_en: '/products/mga-10-ton-diesel-forklift',
        order: 8,
      },
      {
        name: 'Xe Nâng Dầu MGA 15 Tấn',
        name_en: 'MGA 15 Ton Diesel Forklift',
        href: '/san-pham/xe-nang-dau-mga-15-tan',
        href_en: '/products/mga-15-ton-diesel-forklift',
        order: 9,
      },
      {
        name: 'Xe Nâng Dầu MGA 16 Tấn',
        name_en: 'MGA 16 Ton Diesel Forklift',
        href: '/san-pham/xe-nang-dau-mga-16-tan',
        href_en: '/products/mga-16-ton-diesel-forklift',
        order: 10,
      },
      {
        name: 'Xe Nâng Dầu MGA 18 Tấn',
        name_en: 'MGA 18 Ton Diesel Forklift',
        href: '/san-pham/xe-nang-dau-mga-18-tan',
        href_en: '/products/mga-18-ton-diesel-forklift',
        order: 11,
      },
    ];

    // Insert menu items and their translations
    for (const item of menuItems) {
      // Insert menu item
      const result = await queryRunner.query(
        `INSERT INTO menu_items (parent_id, "order", is_active, created_at, updated_at)
         VALUES ($1, $2, true, NOW(), NOW())
         RETURNING id`,
        [parentMenuItemId, item.order]
      );

      const menuItemId = result[0].id;

      // Insert Vietnamese translation
      await queryRunner.query(
        `INSERT INTO menu_item_translations 
         (menu_item_id, locale, label, href, created_at, updated_at)
         VALUES ($1, 'vi', $2, $3, NOW(), NOW())`,
        [menuItemId, item.name, item.href]
      );

      // Insert English translation
      await queryRunner.query(
        `INSERT INTO menu_item_translations 
         (menu_item_id, locale, label, href, created_at, updated_at)
         VALUES ($1, 'en', $2, $3, NOW(), NOW())`,
        [menuItemId, item.name_en, item.href_en]
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Get all menu item IDs that are children of the diesel forklift parent menu
    const parentMenuItemResult = await queryRunner.query(
      `SELECT mit.menu_item_id 
       FROM menu_item_translations mit 
       WHERE mit.href = '/danh-muc-san-pham/xe-nang-dau' 
       LIMIT 1`
    );

    if (parentMenuItemResult && parentMenuItemResult.length > 0) {
      const parentMenuItemId = parentMenuItemResult[0].menu_item_id;

      // Get all child menu item IDs
      const childMenuItems = await queryRunner.query(
        `SELECT id FROM menu_items WHERE parent_id = $1`,
        [parentMenuItemId]
      );

      if (childMenuItems && childMenuItems.length > 0) {
        const menuItemIds = childMenuItems.map((item: { id: number }) => item.id);

        // Delete menu item translations
        await queryRunner.query(
          `DELETE FROM menu_item_translations WHERE menu_item_id = ANY($1)`,
          [menuItemIds]
        );

        // Delete menu items
        await queryRunner.query(
          `DELETE FROM menu_items WHERE id = ANY($1)`,
          [menuItemIds]
        );
      }
    }
  }
} 