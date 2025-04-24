import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateMailTables1743270380298 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create mail_config table
    await queryRunner.createTable(
      new Table({
        name: 'mail_config',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'config',
            type: 'jsonb',
            isNullable: false,
            comment: 'Stores Mailgun configuration (API key, domain, etc)',
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
          },
        ],
      }),
      true,
    );

    // Create index on code column
    await queryRunner.createIndex(
      'mail_config',
      new TableIndex({
        name: 'IDX_MAIL_CONFIG_CODE',
        columnNames: ['code'],
        isUnique: true,
      }),
    );

    // Create mail_logs table
    await queryRunner.createTable(
      new Table({
        name: 'mail_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'from_email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'to_email',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'subject',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'body',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'template_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Mailgun template ID if used',
          },
          {
            name: 'template_data',
            type: 'jsonb',
            isNullable: true,
            comment: 'Template variables data',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            isNullable: false,
            comment: 'Email status: SENT, FAILED, etc',
          },
          {
            name: 'error',
            type: 'text',
            isNullable: true,
            comment: 'Error message if failed',
          },
          {
            name: 'provider_message_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
            comment: 'Mailgun message ID for tracking',
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
      true,
    );

    // Create indexes for mail_logs
    await queryRunner.createIndex(
      'mail_logs',
      new TableIndex({
        name: 'IDX_MAIL_LOGS_STATUS',
        columnNames: ['status'],
      }),
    );

    await queryRunner.createIndex(
      'mail_logs',
      new TableIndex({
        name: 'IDX_MAIL_LOGS_CREATED_AT',
        columnNames: ['created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('mail_logs');
    await queryRunner.dropTable('mail_config');
  }
} 