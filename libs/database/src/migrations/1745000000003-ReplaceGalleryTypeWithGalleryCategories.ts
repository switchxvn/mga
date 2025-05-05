import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class ReplaceGalleryTypeWithGalleryCategories1745000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Tạo bảng n-n gallery_categories
    await queryRunner.createTable(
      new Table({
        name: 'gallery_categories',
        columns: [
          {
            name: 'gallery_id',
            type: 'int',
            isNullable: false,
            isPrimary: true
          },
          {
            name: 'category_id',
            type: 'int',
            isNullable: false,
            isPrimary: true
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'IDX_GALLERY_CATEGORIES_GALLERY_ID',
            columnNames: ['gallery_id'],
          },
          {
            name: 'IDX_GALLERY_CATEGORIES_CATEGORY_ID',
            columnNames: ['category_id'],
          },
        ],
      }),
      true
    );

    // 2. Tạo foreign keys
    await queryRunner.createForeignKey(
      'gallery_categories',
      new TableForeignKey({
        columnNames: ['gallery_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'galleries',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'gallery_categories',
      new TableForeignKey({
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'categories',
        onDelete: 'CASCADE',
      })
    );

    // 3. Chuyển dữ liệu từ cột type sang categories
    // Chúng ta cần đảm bảo có các categories cho từng giá trị type
    // Nhưng điều này sẽ cần làm trong một file seeder riêng hoặc thông qua API

    // 4. Xóa cột type
    await queryRunner.query('ALTER TABLE galleries DROP COLUMN type');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Thêm lại cột type
    await queryRunner.query(
      'ALTER TABLE galleries ADD COLUMN type varchar(50) DEFAULT "common" NOT NULL'
    );

    // 2. Xóa foreign keys
    const foreignKeys = await queryRunner.query(
      'SELECT * FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_NAME = "gallery_categories" AND REFERENCED_TABLE_NAME IS NOT NULL'
    );

    for (const foreignKey of foreignKeys) {
      await queryRunner.dropForeignKey('gallery_categories', foreignKey.CONSTRAINT_NAME);
    }

    // 3. Xóa bảng n-n
    await queryRunner.dropTable('gallery_categories');
  }
} 