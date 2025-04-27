import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export enum RefundReason {
  CHANGE_MIND = 'CHANGE_MIND',
  PRODUCT_DEFECT = 'PRODUCT_DEFECT',
  WRONG_PRODUCT = 'WRONG_PRODUCT',
  SCHEDULE_CHANGE = 'SCHEDULE_CHANGE',
  OTHER = 'OTHER',
}

export enum RefundType {
  MONEY_REFUND = 'MONEY_REFUND',
  RESCHEDULE = 'RESCHEDULE',
  PRODUCT_EXCHANGE = 'PRODUCT_EXCHANGE',
  STORE_CREDIT = 'STORE_CREDIT',
}

export enum RefundStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class CreateOrderRefundTable1743270380312 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'order_refunds',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'order_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'refund_code',
            type: 'varchar',
            length: '50',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'requester_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'requester_phone',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'requester_email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'refund_reason',
            type: 'enum',
            enum: Object.values(RefundReason),
            isNullable: false,
          },
          {
            name: 'refund_type',
            type: 'enum',
            enum: Object.values(RefundType),
            isNullable: false,
          },
          {
            name: 'refund_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'status',
            type: 'enum',
            enum: Object.values(RefundStatus),
            default: `'${RefundStatus.PENDING}'`,
          },
          {
            name: 'details',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'additional_info',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'admin_notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'requested_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'completed_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true
    );

    // Tạo bảng để lưu các sản phẩm cần hoàn trả
    await queryRunner.createTable(
      new Table({
        name: 'order_refund_items',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'refund_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'order_item_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'quantity',
            type: 'int',
            isNullable: false,
            default: 1,
          },
          {
            name: 'refund_amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true
    );

    // Tạo các foreign key
    await queryRunner.createForeignKey(
      'order_refunds',
      new TableForeignKey({
        columnNames: ['order_id'],
        referencedTableName: 'orders',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'order_refund_items',
      new TableForeignKey({
        columnNames: ['refund_id'],
        referencedTableName: 'order_refunds',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'order_refund_items',
      new TableForeignKey({
        columnNames: ['order_item_id'],
        referencedTableName: 'order_items',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('order_refund_items');
    await queryRunner.dropTable('order_refunds');
  }
} 