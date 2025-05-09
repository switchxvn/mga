import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTicketExchangeMenuItem1745000000016 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tìm ID của orders menu parent
    const ordersMenuResult = await queryRunner.query(`
      SELECT id FROM admin_menu_items WHERE code = 'orders' LIMIT 1
    `);
    
    if (ordersMenuResult && ordersMenuResult.length > 0) {
      const ordersMenuId = ordersMenuResult[0].id;
      
      // Thêm menu đổi vé là menu con của orders
      await queryRunner.query(`
        INSERT INTO admin_menu_items (
          code, 
          name, 
          icon, 
          path, 
          parent_id, 
          "order", 
          is_active, 
          available_for_roles
        )
        VALUES (
          'ticket-exchanges', 
          'Đổi vé', 
          'Ticket', 
          '/orders/ticket-exchanges', 
          ${ordersMenuId}, 
          3, 
          true, 
          NULL
        )
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa menu đổi vé
    await queryRunner.query(`
      DELETE FROM admin_menu_items WHERE code = 'ticket-exchanges'
    `);
  }
} 