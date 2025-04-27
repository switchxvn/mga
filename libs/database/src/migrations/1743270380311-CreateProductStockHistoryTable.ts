import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateProductStockHistoryTable1743270380311 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo enum type cho stock history
    await queryRunner.query(`
      CREATE TYPE "stock_adjustment_type_enum" AS ENUM (
        'ADMIN_ADJUSTMENT',
        'CUSTOMER_ORDER',
        'REFUND',
        'INVENTORY_CHECK',
        'RETURN',
        'DAMAGED',
        'INITIAL_STOCK'
      )
    `);

    // Tạo bảng product_stock_history
    await queryRunner.createTable(
      new Table({
        name: 'product_stock_history',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'product_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'variant_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'adjustment_type',
            type: 'stock_adjustment_type_enum',
            isNullable: false,
          },
          {
            name: 'quantity_before',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'adjustment_quantity',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'quantity_after',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'reference_id',
            type: 'int',
            isNullable: true,
            comment: 'Reference ID (e.g., order ID, stock check ID)',
          },
          {
            name: 'reference_type',
            type: 'varchar',
            isNullable: true,
            comment: 'Reference type (e.g., order, stock_check)',
          },
          {
            name: 'note',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: true,
            comment: 'ID of the user who made the adjustment',
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
      true,
    );

    // Tạo foreign key cho product_id
    await queryRunner.createForeignKey(
      'product_stock_history',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'SET NULL',
      }),
    );

    // Tạo foreign key cho variant_id
    await queryRunner.createForeignKey(
      'product_stock_history',
      new TableForeignKey({
        columnNames: ['variant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product_variants',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa foreign keys
    const table = await queryRunner.getTable('product_stock_history');
    const foreignKeys = table?.foreignKeys || [];
    
    for (const foreignKey of foreignKeys) {
      await queryRunner.dropForeignKey('product_stock_history', foreignKey);
    }
    
    // Xóa bảng
    await queryRunner.dropTable('product_stock_history');
    
    // Xóa enum type
    await queryRunner.query(`DROP TYPE "stock_adjustment_type_enum"`);
  }
} 