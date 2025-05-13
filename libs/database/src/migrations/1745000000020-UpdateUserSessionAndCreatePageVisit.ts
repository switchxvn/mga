import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class UpdateUserSessionAndCreatePageVisit1745000000020 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Tạo bảng mới user_page_visits
    await queryRunner.createTable(
      new Table({
        name: 'user_page_visits',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'session_id',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'page_url',
            type: 'varchar',
            length: '2000',
            isNullable: false,
          },
          {
            name: 'referrer',
            type: 'varchar',
            length: '2000',
            isNullable: true,
          },
          {
            name: 'entry_time',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'exit_time',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'time_on_page',
            type: 'int',
            default: 0,
            isNullable: false,
          },
          {
            name: 'is_landing_page',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'is_exit_page',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true
    );

    // 2. Tạo index cho session_id trên bảng user_page_visits
    await queryRunner.createIndex(
      'user_page_visits',
      new TableIndex({
        name: 'IDX_PAGE_VISIT_SESSION_ID',
        columnNames: ['session_id'],
      })
    );

    // 3. Tạo unique index cho session_id trên bảng user_sessions trước
    await queryRunner.createIndex(
      'user_sessions',
      new TableIndex({
        name: 'UQ_USER_SESSION_ID',
        columnNames: ['session_id'],
        isUnique: true,
      })
    );

    // 4. Tạo khóa ngoại từ user_page_visits đến user_sessions
    await queryRunner.createForeignKey(
      'user_page_visits',
      new TableForeignKey({
        name: 'FK_PAGE_VISIT_SESSION',
        columnNames: ['session_id'],
        referencedTableName: 'user_sessions',
        referencedColumnNames: ['session_id'],
        onDelete: 'CASCADE',
      })
    );

    // 5. Thêm cột expire_at vào bảng user_sessions
    await queryRunner.addColumn(
      'user_sessions',
      new TableColumn({
        name: 'expire_at',
        type: 'timestamp',
        isNullable: true,
      })
    );

    // 6. Xóa các cột không cần thiết trên bảng user_sessions
    await queryRunner.dropColumn('user_sessions', 'page_views');
    await queryRunner.dropColumn('user_sessions', 'referrer');
    await queryRunner.dropColumn('user_sessions', 'landing_page');
    await queryRunner.dropColumn('user_sessions', 'exit_page');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Khôi phục các cột đã xóa trên bảng user_sessions
    await queryRunner.addColumn(
      'user_sessions',
      new TableColumn({
        name: 'page_views',
        type: 'int',
        default: 1,
      })
    );

    await queryRunner.addColumn(
      'user_sessions',
      new TableColumn({
        name: 'referrer',
        type: 'varchar',
        length: '2000',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'user_sessions',
      new TableColumn({
        name: 'landing_page',
        type: 'varchar',
        length: '2000',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'user_sessions',
      new TableColumn({
        name: 'exit_page',
        type: 'varchar',
        length: '2000',
        isNullable: true,
      })
    );

    // 2. Xóa cột expire_at từ bảng user_sessions
    await queryRunner.dropColumn('user_sessions', 'expire_at');

    // 3. Xóa khóa ngoại từ user_page_visits đến user_sessions
    await queryRunner.dropForeignKey('user_page_visits', 'FK_PAGE_VISIT_SESSION');

    // 4. Xóa unique index cho session_id trên bảng user_sessions
    await queryRunner.dropIndex('user_sessions', 'UQ_USER_SESSION_ID');

    // 5. Xóa index cho session_id trên bảng user_page_visits
    await queryRunner.dropIndex('user_page_visits', 'IDX_PAGE_VISIT_SESSION_ID');

    // 6. Xóa bảng user_page_visits
    await queryRunner.dropTable('user_page_visits');
  }
} 