import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddElectricForkliftMenuItems1742917167138 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, get the parent menu item ID for electric forklifts
    const parentMenuItemResult = await queryRunner.query(
      `SELECT mit.menu_item_id 
       FROM menu_item_translations mit 
       WHERE mit.href = '/danh-muc-san-pham/xe-nang-dien' 
       LIMIT 1`
    );

    if (!parentMenuItemResult || parentMenuItemResult.length === 0) {
      throw new Error('Parent menu item for electric forklifts not found');
    }

    const parentMenuItemId = parentMenuItemResult[0].menu_item_id;

    // Array of menu items to insert
    const menuItems = [
      {
        name: 'Xe Nâng Điện Đứng Lái MGA 1.0 Tấn',
        name_en: 'MGA 1.0 Ton Stand-up Electric Forklift',
        href: '/san-pham/xe-nang-dien-dung-lai-mga-1-0-tan',
        href_en: '/products/mga-1-0-ton-stand-up-electric-forklift',
        order: 1,
      },
      {
        name: 'Xe Nâng Điện Đứng Lái MGA 1.5 Tấn',
        name_en: 'MGA 1.5 Ton Stand-up Electric Forklift',
        href: '/san-pham/xe-nang-dien-dung-lai-mga-1-5-tan',
        href_en: '/products/mga-1-5-ton-stand-up-electric-forklift',
        order: 2,
      },
      {
        name: 'Xe Nâng Điện Đứng Lái MGA 2.0 Tấn',
        name_en: 'MGA 2.0 Ton Stand-up Electric Forklift',
        href: '/san-pham/xe-nang-dien-dung-lai-mga-2-0-tan',
        href_en: '/products/mga-2-0-ton-stand-up-electric-forklift',
        order: 3,
      },
      {
        name: 'Xe Nâng Điện Đứng Lái MGA 2.5 Tấn',
        name_en: 'MGA 2.5 Ton Stand-up Electric Forklift',
        href: '/san-pham/xe-nang-dien-dung-lai-mga-2-5-tan',
        href_en: '/products/mga-2-5-ton-stand-up-electric-forklift',
        order: 4,
      },
      {
        name: 'Xe Nâng Điện Đứng Lái MGA 3.0 Tấn',
        name_en: 'MGA 3.0 Ton Stand-up Electric Forklift',
        href: '/san-pham/xe-nang-dien-dung-lai-mga-3-0-tan',
        href_en: '/products/mga-3-0-ton-stand-up-electric-forklift',
        order: 5,
      },
      {
        name: 'Xe Nâng Điện Tay Thấp MGA 1.5 Tấn',
        name_en: 'MGA 1.5 Ton Low Electric Pallet Truck',
        href: '/san-pham/xe-nang-dien-tay-thap-mga-1-5-tan',
        href_en: '/products/mga-1-5-ton-low-electric-pallet-truck',
        order: 6,
      },
      {
        name: 'Xe Nâng Điện Stacker',
        name_en: 'Electric Stacker',
        href: '/san-pham/xe-nang-dien-stacker',
        href_en: '/products/electric-stacker',
        order: 7,
      },
      {
        name: 'Xe Nâng Điện MGA 1.5 Tấn',
        name_en: 'MGA 1.5 Ton Electric Forklift',
        href: '/san-pham/xe-nang-dien-mga-1-5-tan',
        href_en: '/products/mga-1-5-ton-electric-forklift',
        order: 8,
      },
      {
        name: 'Xe Nâng Điện MGA 1.8 Tấn',
        name_en: 'MGA 1.8 Ton Electric Forklift',
        href: '/san-pham/xe-nang-dien-mga-1-8-tan',
        href_en: '/products/mga-1-8-ton-electric-forklift',
        order: 9,
      },
      {
        name: 'Xe Nâng Điện MGA 2.0 Tấn',
        name_en: 'MGA 2.0 Ton Electric Forklift',
        href: '/san-pham/xe-nang-dien-mga-2-0-tan',
        href_en: '/products/mga-2-0-ton-electric-forklift',
        order: 10,
      },
      {
        name: 'Xe Nâng Điện MGA 2.5 Tấn',
        name_en: 'MGA 2.5 Ton Electric Forklift',
        href: '/san-pham/xe-nang-dien-mga-2-5-tan',
        href_en: '/products/mga-2-5-ton-electric-forklift',
        order: 11,
      },
      {
        name: 'Xe Nâng Điện MGA 3.0 Tấn',
        name_en: 'MGA 3.0 Ton Electric Forklift',
        href: '/san-pham/xe-nang-dien-mga-3-0-tan',
        href_en: '/products/mga-3-0-ton-electric-forklift',
        order: 12,
      },
      {
        name: 'Xe Nâng Điện MGA 3.5 Tấn',
        name_en: 'MGA 3.5 Ton Electric Forklift',
        href: '/san-pham/xe-nang-dien-mga-3-5-tan',
        href_en: '/products/mga-3-5-ton-electric-forklift',
        order: 13,
      },
      {
        name: 'Xe Nâng Điện Ngồi Lái MGA 1.0 Tấn',
        name_en: 'MGA 1.0 Ton Sit-down Electric Forklift',
        href: '/san-pham/xe-nang-dien-ngoi-lai-mga-1-0-tan',
        href_en: '/products/mga-1-0-ton-sit-down-electric-forklift',
        order: 14,
      },
      {
        name: 'Xe Nâng Điện Ngồi Lái MGA 1.5 Tấn',
        name_en: 'MGA 1.5 Ton Sit-down Electric Forklift',
        href: '/san-pham/xe-nang-dien-ngoi-lai-mga-1-5-tan',
        href_en: '/products/mga-1-5-ton-sit-down-electric-forklift',
        order: 15,
      }
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
    // Get all menu item IDs that are children of the electric forklift parent menu
    const parentMenuItemResult = await queryRunner.query(
      `SELECT mit.menu_item_id 
       FROM menu_item_translations mit 
       WHERE mit.href = '/danh-muc-san-pham/xe-nang-dien' 
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