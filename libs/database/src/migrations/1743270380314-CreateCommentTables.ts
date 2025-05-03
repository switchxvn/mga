import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCommentTables1743270380314 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng comments
    await queryRunner.createTable(
      new Table({
        name: 'comments',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'post_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'parent_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'author_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'author_email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'pending'",
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

    // Tạo Foreign Key cho post_id
    await queryRunner.createForeignKey(
      'comments',
      new TableForeignKey({
        columnNames: ['post_id'],
        referencedTableName: 'posts',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      })
    );

    // Tạo Foreign Key cho user_id
    await queryRunner.createForeignKey(
      'comments',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      })
    );

    // Tạo Foreign Key cho parent_id (self-referencing)
    await queryRunner.createForeignKey(
      'comments',
      new TableForeignKey({
        columnNames: ['parent_id'],
        referencedTableName: 'comments',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      })
    );

    // Create index
    await queryRunner.query('CREATE INDEX idx_comments_post_id ON comments (post_id)');
    await queryRunner.query('CREATE INDEX idx_comments_user_id ON comments (user_id)');
    await queryRunner.query('CREATE INDEX idx_comments_parent_id ON comments (parent_id)');
    await queryRunner.query('CREATE INDEX idx_comments_status ON comments (status)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query('DROP INDEX IF EXISTS idx_comments_post_id');
    await queryRunner.query('DROP INDEX IF EXISTS idx_comments_user_id');
    await queryRunner.query('DROP INDEX IF EXISTS idx_comments_parent_id');
    await queryRunner.query('DROP INDEX IF EXISTS idx_comments_status');

    // Drop foreign keys
    const table = await queryRunner.getTable('comments');
    if (table) {
      const foreignKeys = table.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('comments', foreignKey);
      }
    }

    // Drop table
    await queryRunner.dropTable('comments', true);
  }
} 