import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AddProductSpecifications1741371275869 implements MigrationInterface {
  name = 'AddProductSpecifications1741371275869';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng product_specifications
    await queryRunner.createTable(
      new Table({
        name: 'product_specifications',
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
            isNullable: false,
          },
          {
            name: 'position',
            type: 'int',
            default: 0,
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

    // Tạo bảng product_specification_translations
    await queryRunner.createTable(
      new Table({
        name: 'product_specification_translations',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'specification_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'locale',
            type: 'varchar',
            length: '2',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'value',
            type: 'text',
            isNullable: true,
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

    // Tạo foreign key cho bảng product_specifications
    await queryRunner.createForeignKey(
      'product_specifications',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'products',
        onDelete: 'CASCADE',
      })
    );

    // Tạo foreign key cho bảng product_specification_translations
    await queryRunner.createForeignKey(
      'product_specification_translations',
      new TableForeignKey({
        columnNames: ['specification_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'product_specifications',
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa foreign key của bảng product_specification_translations
    const specTranslationTable = await queryRunner.getTable('product_specification_translations');
    const specTranslationForeignKey = specTranslationTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('specification_id') !== -1
    );
    if (specTranslationForeignKey) {
      await queryRunner.dropForeignKey('product_specification_translations', specTranslationForeignKey);
    }

    // Xóa foreign key của bảng product_specifications
    const specTable = await queryRunner.getTable('product_specifications');
    const specForeignKey = specTable?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('product_id') !== -1
    );
    if (specForeignKey) {
      await queryRunner.dropForeignKey('product_specifications', specForeignKey);
    }

    // Xóa bảng product_specification_translations
    await queryRunner.dropTable('product_specification_translations');

    // Xóa bảng product_specifications
    await queryRunner.dropTable('product_specifications');
  }
} 