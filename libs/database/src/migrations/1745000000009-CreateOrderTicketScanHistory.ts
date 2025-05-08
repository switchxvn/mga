import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateOrderTicketScanHistory1745000000009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create order_ticket_scan_history table
    await queryRunner.createTable(
      new Table({
        name: 'order_ticket_scan_history',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'order_item_id',
            type: 'int',
          },
          {
            name: 'scanned_by',
            type: 'uuid',
            comment: 'UUID of the user who scanned the ticket',
          },
          {
            name: 'scanned_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'location',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Location where the ticket was scanned',
          },
          {
            name: 'device_info',
            type: 'jsonb',
            isNullable: true,
            comment: 'Information about the scanning device',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Add foreign key for order_ticket_scan_history to order_items
    await queryRunner.createForeignKey(
      'order_ticket_scan_history',
      new TableForeignKey({
        columnNames: ['order_item_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'order_items',
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    const table = await queryRunner.getTable('order_ticket_scan_history');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('order_item_id') !== -1
    );
    await queryRunner.dropForeignKey('order_ticket_scan_history', foreignKey);

    // Drop table
    await queryRunner.dropTable('order_ticket_scan_history');
  }
} 