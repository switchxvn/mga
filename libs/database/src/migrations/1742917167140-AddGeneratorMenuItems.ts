import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGeneratorMenuItems1742917167140 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, get the parent menu item ID for generators
    const parentMenuItemResult = await queryRunner.query(
      `SELECT mit.menu_item_id 
       FROM menu_item_translations mit 
       WHERE mit.href = '/danh-muc-san-pham/may-phat-dien' 
       LIMIT 1`
    );

    if (!parentMenuItemResult || parentMenuItemResult.length === 0) {
      throw new Error('Parent menu item for generators not found');
    }

    const parentMenuItemId = parentMenuItemResult[0].menu_item_id;

    // Array of menu items to insert
    const menuItems = [
      {
        name: 'Máy Phát Điện MGA 33KVA',
        name_en: 'MGA 33KVA Generator',
        href: '/san-pham/may-phat-dien-mga-33kva',
        href_en: '/products/mga-33kva-generator',
        order: 1,
      },
      {
        name: 'Máy Phát Điện MGA 40KVA',
        name_en: 'MGA 40KVA Generator',
        href: '/san-pham/may-phat-dien-mga-40kva',
        href_en: '/products/mga-40kva-generator',
        order: 2,
      },
      {
        name: 'Máy Phát Điện MGA 70KVA',
        name_en: 'MGA 70KVA Generator',
        href: '/san-pham/may-phat-dien-mga-70kva',
        href_en: '/products/mga-70kva-generator',
        order: 3,
      },
      {
        name: 'Máy Phát Điện MGA 95KVA',
        name_en: 'MGA 95KVA Generator',
        href: '/san-pham/may-phat-dien-mga-95kva',
        href_en: '/products/mga-95kva-generator',
        order: 4,
      },
      {
        name: 'Máy Phát Điện MGA 110KVA',
        name_en: 'MGA 110KVA Generator',
        href: '/san-pham/may-phat-dien-mga-110kva',
        href_en: '/products/mga-110kva-generator',
        order: 5,
      },
      {
        name: 'Máy Phát Điện MGA 138KVA',
        name_en: 'MGA 138KVA Generator',
        href: '/san-pham/may-phat-dien-mga-138kva',
        href_en: '/products/mga-138kva-generator',
        order: 6,
      },
      {
        name: 'Máy Phát Điện MGA 145KVA',
        name_en: 'MGA 145KVA Generator',
        href: '/san-pham/may-phat-dien-mga-145kva',
        href_en: '/products/mga-145kva-generator',
        order: 7,
      },
      {
        name: 'Máy Phát Điện MGA 198KVA',
        name_en: 'MGA 198KVA Generator',
        href: '/san-pham/may-phat-dien-mga-198kva',
        href_en: '/products/mga-198kva-generator',
        order: 8,
      },
      {
        name: 'Máy Phát Điện MGA 220KVA',
        name_en: 'MGA 220KVA Generator',
        href: '/san-pham/may-phat-dien-mga-220kva',
        href_en: '/products/mga-220kva-generator',
        order: 9,
      },
      {
        name: 'Máy Phát Điện MGA 265KVA',
        name_en: 'MGA 265KVA Generator',
        href: '/san-pham/may-phat-dien-mga-265kva',
        href_en: '/products/mga-265kva-generator',
        order: 10,
      },
      {
        name: 'Máy Phát Điện MGA 275KVA',
        name_en: 'MGA 275KVA Generator',
        href: '/san-pham/may-phat-dien-mga-275kva',
        href_en: '/products/mga-275kva-generator',
        order: 11,
      },
      {
        name: 'Máy Phát Điện MGA 350KVA',
        name_en: 'MGA 350KVA Generator',
        href: '/san-pham/may-phat-dien-mga-350kva',
        href_en: '/products/mga-350kva-generator',
        order: 12,
      },
      {
        name: 'Máy Phát Điện MGA 375KVA',
        name_en: 'MGA 375KVA Generator',
        href: '/san-pham/may-phat-dien-mga-375kva',
        href_en: '/products/mga-375kva-generator',
        order: 13,
      },
      {
        name: 'Máy Phát Điện MGA 388KVA',
        name_en: 'MGA 388KVA Generator',
        href: '/san-pham/may-phat-dien-mga-388kva',
        href_en: '/products/mga-388kva-generator',
        order: 14,
      },
      {
        name: 'Máy Phát Điện MGA 500KVA',
        name_en: 'MGA 500KVA Generator',
        href: '/san-pham/may-phat-dien-mga-500kva',
        href_en: '/products/mga-500kva-generator',
        order: 15,
      },
      {
        name: 'Máy Phát Điện MGA 550KVA',
        name_en: 'MGA 550KVA Generator',
        href: '/san-pham/may-phat-dien-mga-550kva',
        href_en: '/products/mga-550kva-generator',
        order: 16,
      },
      {
        name: 'Máy Phát Điện MGA 600KVA',
        name_en: 'MGA 600KVA Generator',
        href: '/san-pham/may-phat-dien-mga-600kva',
        href_en: '/products/mga-600kva-generator',
        order: 17,
      },
      {
        name: 'Máy Phát Điện MGA 650KVA',
        name_en: 'MGA 650KVA Generator',
        href: '/san-pham/may-phat-dien-mga-650kva',
        href_en: '/products/mga-650kva-generator',
        order: 18,
      },
      {
        name: 'Máy Phát Điện MGA 688KVA',
        name_en: 'MGA 688KVA Generator',
        href: '/san-pham/may-phat-dien-mga-688kva',
        href_en: '/products/mga-688kva-generator',
        order: 19,
      },
      {
        name: 'Máy Phát Điện MGA 1250KVA',
        name_en: 'MGA 1250KVA Generator',
        href: '/san-pham/may-phat-dien-mga-1250kva',
        href_en: '/products/mga-1250kva-generator',
        order: 20,
      },
      {
        name: 'Máy Phát Điện MGA 2500KVA',
        name_en: 'MGA 2500KVA Generator',
        href: '/san-pham/may-phat-dien-mga-2500kva',
        href_en: '/products/mga-2500kva-generator',
        order: 21,
      }
    ];

    // Insert menu items and their translations
    for (const item of menuItems) {
      // Insert menu item
      const result = await queryRunner.query(
        `INSERT INTO menu_items (id, parent_id, "order", is_active, created_at, updated_at)
         VALUES (nextval('menu_items_id_seq'), $1, $2, true, NOW(), NOW())
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
    // Get all menu item IDs that are children of the generator parent menu
    const parentMenuItemResult = await queryRunner.query(
      `SELECT mit.menu_item_id 
       FROM menu_item_translations mit 
       WHERE mit.href = '/danh-muc-san-pham/may-phat-dien' 
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