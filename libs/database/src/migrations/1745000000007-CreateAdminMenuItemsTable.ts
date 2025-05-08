import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateAdminMenuItemsTable1745000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'admin_menu_items',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'icon',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'path',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'parent_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'order',
            type: 'int',
            default: 0,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'available_for_roles',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Comma-separated role codes that can see this menu item',
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
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    );

    // Add foreign key to self for parent-child relationship
    await queryRunner.createForeignKey(
      'admin_menu_items',
      new TableForeignKey({
        columnNames: ['parent_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'admin_menu_items',
        onDelete: 'SET NULL',
      })
    );

    // Seed default admin menu items
    await queryRunner.query(`
      INSERT INTO admin_menu_items (code, name, icon, path, parent_id, "order", is_active, available_for_roles)
      VALUES 
        ('dashboard', 'Dashboard', 'Home', '/', NULL, 1, true, NULL),
        ('settings', 'Settings', 'Settings', '/settings', NULL, 99, true, 'SUPER_ADMIN');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    const table = await queryRunner.getTable('admin_menu_items');
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('parent_id') !== -1
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('admin_menu_items', foreignKey);
    }
    
    // Drop table
    await queryRunner.dropTable('admin_menu_items');
  }
} 