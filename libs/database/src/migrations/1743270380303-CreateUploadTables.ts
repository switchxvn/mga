import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUploadTables1743270380303 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create upload_config table
    await queryRunner.createTable(
      new Table({
        name: 'upload_config',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'provider',
            type: 'varchar',
            length: '50',
            default: "'s3'",
          },
          {
            name: 'endpoint',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'region',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'bucket',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'access_key',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'secret_key',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'public_url',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
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

    // Create uploads table
    await queryRunner.createTable(
      new Table({
        name: 'uploads',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'original_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'filename',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'path',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'mime_type',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'size',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'url',
            type: 'varchar',
            length: '500',
            isNullable: false,
          },
          {
            name: 'provider',
            type: 'varchar',
            length: '50',
            default: "'s3'",
          },
          {
            name: 'upload_by',
            type: 'uuid',
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
        foreignKeys: [
          {
            columnNames: ['upload_by'],
            referencedTableName: 'users',
            referencedColumnNames: ['id'],
            onDelete: 'SET NULL',
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('uploads');
    await queryRunner.dropTable('upload_config');
  }
} 