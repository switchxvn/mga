import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateOrderTicketSections1743270380305 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create order_ticket_sections table
    await queryRunner.createTable(
      new Table({
        name: 'order_ticket_sections',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['banner', 'introduce', 'ticket_order'],
            default: "'banner'",
          },
          {
            name: 'component_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'order',
            type: 'int',
            default: 0,
          },
          {
            name: 'settings',
            type: 'jsonb',
            default: "'{}'::jsonb",
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
      true
    );

    // Create order_ticket_section_translations table
    await queryRunner.createTable(
      new Table({
        name: 'order_ticket_section_translations',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'section_id',
            type: 'int',
          },
          {
            name: 'locale',
            type: 'varchar',
            length: '2',
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'subtitle',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'content',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'data',
            type: 'jsonb',
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

    // Add foreign key
    await queryRunner.createForeignKey(
      'order_ticket_section_translations',
      new TableForeignKey({
        columnNames: ['section_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'order_ticket_sections',
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('order_ticket_section_translations');
    await queryRunner.dropTable('order_ticket_sections');
  }
} 