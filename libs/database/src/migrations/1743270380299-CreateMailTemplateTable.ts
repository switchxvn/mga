import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMailTemplateTable1743270380299 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'mail_templates',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '100',
            isUnique: true,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'subject',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'html',
            type: 'text',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'from_email',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'from_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'variables',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
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

    // Add index on code for faster lookups
    await queryRunner.query(
      'CREATE INDEX idx_mail_templates_code ON mail_templates (code);'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('mail_templates', 'idx_mail_templates_code');
    await queryRunner.dropTable('mail_templates');
  }
} 