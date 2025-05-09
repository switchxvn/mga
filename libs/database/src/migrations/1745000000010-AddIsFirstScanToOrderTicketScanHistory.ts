import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddIsFirstScanToOrderTicketScanHistory1745000000010 implements MigrationInterface {
  name = 'AddIsFirstScanToOrderTicketScanHistory1745000000010'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Thêm cột is_first_scan vào bảng order_ticket_scan_history
    await queryRunner.addColumn(
      'order_ticket_scan_history',
      new TableColumn({
        name: 'is_first_scan',
        type: 'boolean',
        default: false,
        isNullable: false
      })
    );

    // Cập nhật giá trị is_first_scan cho dữ liệu hiện có
    // Đánh dấu scan đầu tiên cho mỗi order_item_id là true
    await queryRunner.query(`
      WITH first_scans AS (
        SELECT 
          MIN(id) as id
        FROM order_ticket_scan_history
        GROUP BY order_item_id
      )
      UPDATE order_ticket_scan_history
      SET is_first_scan = true
      WHERE id IN (SELECT id FROM first_scans)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa cột is_first_scan
    await queryRunner.dropColumn('order_ticket_scan_history', 'is_first_scan');
  }
} 