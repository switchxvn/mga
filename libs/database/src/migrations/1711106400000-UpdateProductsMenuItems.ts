import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateProductsMenuItems1711106400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, update the main products menu item
    await queryRunner.query(`
      UPDATE menu_item_translations 
      SET label = 'Sản phẩm xe nâng' 
      WHERE menu_item_id = (
        SELECT id FROM menu_items WHERE href = '/products'
      ) AND locale = 'vi'
    `);

    await queryRunner.query(`
      UPDATE menu_item_translations 
      SET label = 'Forklift Products' 
      WHERE menu_item_id = (
        SELECT id FROM menu_items WHERE href = '/products'
      ) AND locale = 'en'
    `);

    // Update mega menu columns for the products menu
    const megaMenuColumns = [
      {
        title: 'Danh mục xe',
        items: [
          { href: '/products/diesel-forklift', label: 'Xe nâng dầu diesel' },
          { href: '/products/electric-forklift', label: 'Xe nâng điện' },
          { href: '/products/lpg-forklift', label: 'Xe nâng gas LPG' },
          { href: '/products/reach-truck', label: 'Xe nâng reach truck' },
          { href: '/products/electric-pallet', label: 'Xe nâng tay điện' }
        ]
      },
      {
        title: 'Thương hiệu',
        items: [
          { href: '/products/brand/toyota', label: 'Toyota' },
          { href: '/products/brand/mitsubishi', label: 'Mitsubishi' },
          { href: '/products/brand/komatsu', label: 'Komatsu' },
          { href: '/products/brand/hangcha', label: 'Hangcha' },
          { href: '/products/brand/nissan', label: 'Nissan' }
        ]
      },
      {
        title: 'Tải trọng',
        items: [
          { href: '/products/capacity/1-2-tons', label: '1 - 2 tấn' },
          { href: '/products/capacity/2-3-tons', label: '2 - 3 tấn' },
          { href: '/products/capacity/3-5-tons', label: '3 - 5 tấn' },
          { href: '/products/capacity/5-10-tons', label: '5 - 10 tấn' },
          { href: '/products/capacity/above-10-tons', label: 'Trên 10 tấn' }
        ]
      }
    ];

    await queryRunner.query(`
      UPDATE menu_items 
      SET mega_menu_columns = $1,
          has_mega_menu = true
      WHERE href = '/products'
    `, [JSON.stringify(megaMenuColumns)]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restore the original menu items
    await queryRunner.query(`
      UPDATE menu_item_translations 
      SET label = 'Sản phẩm' 
      WHERE menu_item_id = (
        SELECT id FROM menu_items WHERE href = '/products'
      ) AND locale = 'vi'
    `);

    await queryRunner.query(`
      UPDATE menu_item_translations 
      SET label = 'Products' 
      WHERE menu_item_id = (
        SELECT id FROM menu_items WHERE href = '/products'
      ) AND locale = 'en'
    `);

    // Reset mega menu columns
    await queryRunner.query(`
      UPDATE menu_items 
      SET mega_menu_columns = NULL,
          has_mega_menu = false
      WHERE href = '/products'
    `);
  }
} 