import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPriceRequestMenuItem1745000000025 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Find ID of orders menu parent
    const ordersMenuResult = await queryRunner.query(`
      SELECT id FROM admin_menu_items WHERE code = 'orders' LIMIT 1
    `);
    
    if (ordersMenuResult && ordersMenuResult.length > 0) {
      const ordersMenuId = ordersMenuResult[0].id;
      
      // Add Price Request as child menu of orders
      await queryRunner.query(`
        INSERT INTO admin_menu_items (
          code, 
          name, 
          icon, 
          path, 
          parent_id, 
          "order", 
          is_active, 
          available_for_roles,
          created_at,
          updated_at
        )
        VALUES (
          'price-requests', 
          'Yêu cầu báo giá', 
          'Receipt', 
          '/orders/price-requests', 
          ${ordersMenuId}, 
          4, 
          true, 
          NULL,
          NOW(),
          NOW()
        )
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove Price Request menu item
    await queryRunner.query(`
      DELETE FROM admin_menu_items WHERE code = 'price-requests'
    `);
  }
} 