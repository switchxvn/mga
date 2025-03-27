import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForkliftServiceMenuItems1743000000018 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, find the parent menu item with href 'dich-vu'
    const [parentMenuItem] = await queryRunner.query(
      `SELECT mi.id FROM menu_items mi 
       INNER JOIN menu_item_translations mit ON mi.id = mit.menu_item_id 
       WHERE mit.href = '/dich-vu' LIMIT 1`
    );

    if (!parentMenuItem) {
      throw new Error('Parent menu item with href "dich-vu" not found');
    }

    // Insert new menu items
    const menuItems = [
      {
        defaultLocale: 'vi',
        icon: null,
        order: 1,
        level: 2,
        isActive: true,
        parentId: parentMenuItem.id
      },
      {
        defaultLocale: 'vi',
        icon: null,
        order: 2,
        level: 2,
        isActive: true,
        parentId: parentMenuItem.id
      },
      {
        defaultLocale: 'vi',
        icon: null,
        order: 3,
        level: 2,
        isActive: true,
        parentId: parentMenuItem.id
      }
    ];

    for (const item of menuItems) {
      const result = await queryRunner.query(
        `INSERT INTO menu_items (default_locale, icon, "order", level, is_active, parent_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [item.defaultLocale, item.icon, item.order, item.level, item.isActive, item.parentId]
      );

      const menuItemId = result[0].id;

      // Insert translations for Vietnamese
      await queryRunner.query(
        `INSERT INTO menu_item_translations (label, href, locale, menu_item_id)
         VALUES ($1, $2, $3, $4)`,
        [
          item.order === 1 ? 'Thuê xe nâng' :
          item.order === 2 ? 'Sửa xe nâng' :
          'Phụ tùng xe nâng',
          
          item.order === 1 ? 'dich-vu/cho-thue-xe-nang' :
          item.order === 2 ? 'dich-vu/sua-xe-nang' :
          'danh-muc-san-pham/phu-tung-xe-nang',
          
          'vi',
          menuItemId
        ]
      );

      // Insert translations for English
      await queryRunner.query(
        `INSERT INTO menu_item_translations (label, href, locale, menu_item_id)
         VALUES ($1, $2, $3, $4)`,
        [
          item.order === 1 ? 'Forklift Rental' :
          item.order === 2 ? 'Forklift Repair' :
          'Forklift Parts',
          
          item.order === 1 ? 'dich-vu/cho-thue-xe-nang' :
          item.order === 2 ? 'dich-vu/sua-xe-nang' :
          'danh-muc-san-pham/phu-tung-xe-nang',
          
          'en',
          menuItemId
        ]
      );

      // Insert translations for Korean
      await queryRunner.query(
        `INSERT INTO menu_item_translations (label, href, locale, menu_item_id)
         VALUES ($1, $2, $3, $4)`,
        [
          item.order === 1 ? '지게차 대여' :
          item.order === 2 ? '지게차 수리' :
          '지게차 부품',
          
          item.order === 1 ? 'dich-vu/cho-thue-xe-nang' :
          item.order === 2 ? 'dich-vu/sua-xe-nang' :
          'danh-muc-san-pham/phu-tung-xe-nang',
          
          'ko',
          menuItemId
        ]
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Find and delete the menu items by their hrefs
    const hrefs = [
      'dich-vu/cho-thue-xe-nang',
      'dich-vu/sua-xe-nang',
      'danh-muc-san-pham/phu-tung-xe-nang'
    ];

    for (const href of hrefs) {
      const [menuItemTranslation] = await queryRunner.query(
        `SELECT menu_item_id FROM menu_item_translations WHERE href = $1 LIMIT 1`,
        [href]
      );

      if (menuItemTranslation) {
        await queryRunner.query(
          `DELETE FROM menu_items WHERE id = $1`,
          [menuItemTranslation.menu_item_id]
        );
      }
    }
  }
} 