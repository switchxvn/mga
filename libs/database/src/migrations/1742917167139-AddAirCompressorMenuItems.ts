import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAirCompressorMenuItems1742917167139 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, get the parent menu item ID for air compressors
    const parentMenuItemResult = await queryRunner.query(
      `SELECT mit.menu_item_id 
       FROM menu_item_translations mit 
       WHERE mit.href = '/danh-muc-san-pham/may-nen-khi' 
       LIMIT 1`
    );

    if (!parentMenuItemResult || parentMenuItemResult.length === 0) {
      throw new Error('Parent menu item for air compressors not found');
    }

    const parentMenuItemId = parentMenuItemResult[0].menu_item_id;

    // Array of menu items to insert
    const menuItems = [
      {
        name: 'Máy Nén Khí MGA 7.5HP',
        name_en: 'MGA 7.5HP Air Compressor',
        href: '/san-pham/may-nen-khi-mga-7-5hp',
        href_en: '/products/mga-7-5hp-air-compressor',
        order: 1,
      },
      {
        name: 'Máy Nén Khí MGA 10HP',
        name_en: 'MGA 10HP Air Compressor',
        href: '/san-pham/may-nen-khi-mga-10hp',
        href_en: '/products/mga-10hp-air-compressor',
        order: 2,
      },
      {
        name: 'Máy Nén Khí MGA 15HP',
        name_en: 'MGA 15HP Air Compressor',
        href: '/san-pham/may-nen-khi-mga-15hp',
        href_en: '/products/mga-15hp-air-compressor',
        order: 3,
      },
      {
        name: 'Máy Nén Khí MGA 20HP',
        name_en: 'MGA 20HP Air Compressor',
        href: '/san-pham/may-nen-khi-mga-20hp',
        href_en: '/products/mga-20hp-air-compressor',
        order: 4,
      },
      {
        name: 'Máy Nén Khí MGA 25HP',
        name_en: 'MGA 25HP Air Compressor',
        href: '/san-pham/may-nen-khi-mga-25hp',
        href_en: '/products/mga-25hp-air-compressor',
        order: 5,
      },
      {
        name: 'Máy Nén Khí MGA 30HP',
        name_en: 'MGA 30HP Air Compressor',
        href: '/san-pham/may-nen-khi-mga-30hp',
        href_en: '/products/mga-30hp-air-compressor',
        order: 6,
      },
      {
        name: 'Máy Nén Khí MGA 40HP',
        name_en: 'MGA 40HP Air Compressor',
        href: '/san-pham/may-nen-khi-mga-40hp',
        href_en: '/products/mga-40hp-air-compressor',
        order: 7,
      },
      {
        name: 'Máy Nén Khí MGA 50HP',
        name_en: 'MGA 50HP Air Compressor',
        href: '/san-pham/may-nen-khi-mga-50hp',
        href_en: '/products/mga-50hp-air-compressor',
        order: 8,
      },
      {
        name: 'Máy Nén Khí MGA 60HP',
        name_en: 'MGA 60HP Air Compressor',
        href: '/san-pham/may-nen-khi-mga-60hp',
        href_en: '/products/mga-60hp-air-compressor',
        order: 9,
      },
      {
        name: 'Máy Nén Khí MGA 75HP',
        name_en: 'MGA 75HP Air Compressor',
        href: '/san-pham/may-nen-khi-mga-75hp',
        href_en: '/products/mga-75hp-air-compressor',
        order: 10,
      },
      {
        name: 'Máy Nén Khí MGA 100HP',
        name_en: 'MGA 100HP Air Compressor',
        href: '/san-pham/may-nen-khi-mga-100hp',
        href_en: '/products/mga-100hp-air-compressor',
        order: 11,
      },
      {
        name: 'Máy Nén Khí MGA 125HP',
        name_en: 'MGA 125HP Air Compressor',
        href: '/san-pham/may-nen-khi-mga-125hp',
        href_en: '/products/mga-125hp-air-compressor',
        order: 12,
      },
      {
        name: 'Máy Nén Khí MGA 150HP',
        name_en: 'MGA 150HP Air Compressor',
        href: '/san-pham/may-nen-khi-mga-150hp',
        href_en: '/products/mga-150hp-air-compressor',
        order: 13,
      },
      {
        name: 'Máy Nén Khí MGA 180HP',
        name_en: 'MGA 180HP Air Compressor',
        href: '/san-pham/may-nen-khi-mga-180hp',
        href_en: '/products/mga-180hp-air-compressor',
        order: 14,
      },
      {
        name: 'Máy Nén Khí MGA 220HP',
        name_en: 'MGA 220HP Air Compressor',
        href: '/san-pham/may-nen-khi-mga-220hp',
        href_en: '/products/mga-220hp-air-compressor',
        order: 15,
      },
      {
        name: 'Máy Nén Khí MGA 250HP',
        name_en: 'MGA 250HP Air Compressor',
        href: '/san-pham/may-nen-khi-mga-250hp',
        href_en: '/products/mga-250hp-air-compressor',
        order: 16,
      },
      {
        name: 'Máy Nén Khí MGA 270HP',
        name_en: 'MGA 270HP Air Compressor',
        href: '/san-pham/may-nen-khi-mga-270hp',
        href_en: '/products/mga-270hp-air-compressor',
        order: 17,
      },
      {
        name: 'Máy Nén Khí MGA 300HP',
        name_en: 'MGA 300HP Air Compressor',
        href: '/san-pham/may-nen-khi-mga-300hp',
        href_en: '/products/mga-300hp-air-compressor',
        order: 18,
      },
      {
        name: 'Máy Nén Khí MGA 340HP',
        name_en: 'MGA 340HP Air Compressor',
        href: '/san-pham/may-nen-khi-mga-340hp',
        href_en: '/products/mga-340hp-air-compressor',
        order: 19,
      },
      {
        name: 'Máy Nén Khí MGA 375HP',
        name_en: 'MGA 375HP Air Compressor',
        href: '/san-pham/may-nen-khi-mga-375hp',
        href_en: '/products/mga-375hp-air-compressor',
        order: 20,
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
    // Get all menu item IDs that are children of the air compressor parent menu
    const parentMenuItemResult = await queryRunner.query(
      `SELECT mit.menu_item_id 
       FROM menu_item_translations mit 
       WHERE mit.href = '/danh-muc-san-pham/may-nen-khi' 
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