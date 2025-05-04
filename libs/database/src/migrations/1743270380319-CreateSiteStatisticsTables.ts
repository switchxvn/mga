import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateSiteStatisticsTables1743270380319 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng site_statistics_settings để lưu cấu hình hiển thị thống kê
    await queryRunner.createTable(
      new Table({
        name: 'site_statistics_settings',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'is_enabled',
            type: 'boolean',
            default: true,
            comment: 'Bật/tắt hiển thị thống kê',
          },
          {
            name: 'display_in_footer',
            type: 'boolean',
            default: true,
            comment: 'Hiển thị trong footer',
          },
          {
            name: 'display_items',
            type: 'json',
            isNullable: true,
            comment: 'Các thống kê sẽ hiển thị (total_visits, online_users, etc.)',
          },
          {
            name: 'style_settings',
            type: 'json',
            isNullable: true,
            comment: 'Cấu hình style cho phần thống kê',
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
          {
            name: 'creator_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'updater_id',
            type: 'int',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Tạo bảng site_statistics để lưu thống kê
    await queryRunner.createTable(
      new Table({
        name: 'site_statistics',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'key',
            type: 'varchar',
            length: '50',
            comment: 'Khóa thống kê (total_visits, total_users, ...)',
          },
          {
            name: 'value',
            type: 'varchar',
            length: '255',
            comment: 'Giá trị thống kê',
          },
          {
            name: 'value_number',
            type: 'bigint',
            isNullable: true,
            comment: 'Giá trị số (nếu có)',
          },
          {
            name: 'display_name',
            type: 'varchar',
            length: '100',
            comment: 'Tên hiển thị',
          },
          {
            name: 'icon',
            type: 'varchar',
            length: '50',
            isNullable: true,
            comment: 'Icon hiển thị',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            comment: 'Mô tả thống kê',
          },
          {
            name: 'is_visible',
            type: 'boolean',
            default: true,
            comment: 'Hiển thị trên frontend',
          },
          {
            name: 'display_order',
            type: 'int',
            default: 0,
            comment: 'Thứ tự hiển thị',
          },
          {
            name: 'last_reset',
            type: 'timestamp',
            isNullable: true,
            comment: 'Thời gian reset lần cuối',
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

    // Tạo bảng site_statistics_history để lưu lịch sử thống kê
    await queryRunner.createTable(
      new Table({
        name: 'site_statistics_history',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'statistic_id',
            type: 'int',
            comment: 'ID của thống kê',
          },
          {
            name: 'value',
            type: 'varchar',
            length: '255',
            comment: 'Giá trị thống kê tại thời điểm ghi',
          },
          {
            name: 'value_number',
            type: 'bigint',
            isNullable: true,
            comment: 'Giá trị số tại thời điểm ghi',
          },
          {
            name: 'recorded_at',
            type: 'timestamp',
            default: 'now()',
            comment: 'Thời gian ghi',
          },
          {
            name: 'period_type',
            type: 'varchar',
            length: '20',
            comment: 'Loại kỳ (daily, weekly, monthly)',
          },
        ],
      }),
      true,
    );

    // Tạo bảng site_statistics_translations để lưu đa ngôn ngữ
    await queryRunner.createTable(
      new Table({
        name: 'site_statistics_translations',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'statistic_id',
            type: 'int',
            comment: 'ID của thống kê',
          },
          {
            name: 'locale',
            type: 'varchar',
            length: '5',
            comment: 'Mã ngôn ngữ',
          },
          {
            name: 'display_name',
            type: 'varchar',
            length: '100',
            comment: 'Tên hiển thị theo ngôn ngữ',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            comment: 'Mô tả theo ngôn ngữ',
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

    // Thêm foreign key
    await queryRunner.createForeignKey(
      'site_statistics_history',
      new TableForeignKey({
        columnNames: ['statistic_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'site_statistics',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'site_statistics_translations',
      new TableForeignKey({
        columnNames: ['statistic_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'site_statistics',
        onDelete: 'CASCADE',
      }),
    );

    // Thêm dữ liệu mẫu
    await queryRunner.query(`
      INSERT INTO site_statistics (key, value, value_number, display_name, icon, description, display_order) 
      VALUES 
      ('total_visits', '0', 0, 'Tổng lượt truy cập', 'ph:eye', 'Tổng số lượt truy cập trang web', 1),
      ('daily_visits', '0', 0, 'Lượt truy cập hôm nay', 'ph:calendar-day', 'Lượt truy cập trong ngày hôm nay', 2),
      ('online_users', '0', 0, 'Đang trực tuyến', 'ph:users', 'Số người dùng đang trực tuyến', 3),
      ('total_registered_users', '0', 0, 'Thành viên', 'ph:user-circle', 'Tổng số thành viên đã đăng ký', 4),
      ('total_time_spent', '0', 0, 'Tổng thời gian', 'ph:clock', 'Tổng thời gian người dùng đã dành trên trang web', 5)
    `);

    // Thêm dữ liệu mẫu cho bảng settings
    await queryRunner.query(`
      INSERT INTO site_statistics_settings (is_enabled, display_in_footer, display_items, style_settings)
      VALUES (
        true, 
        true, 
        '["total_visits", "daily_visits", "online_users", "total_registered_users"]',
        '{"backgroundColor": "rgba(255, 255, 255, 0.1)", "textColor": "#ffffff", "iconColor": "#ffffff", "valueColor": "#ffffff", "titleColor": "#ffffff", "borderRadius": "0.5rem", "padding": "1rem", "iconSize": "1.5rem", "fontSize": "0.875rem", "valueFontSize": "1.25rem", "titleFontSize": "0.75rem", "gap": "0.5rem"}'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa foreign key
    const statisticsHistoryTable = await queryRunner.getTable('site_statistics_history');
    const statisticsHistoryForeignKey = statisticsHistoryTable.foreignKeys.find(
      fk => fk.columnNames.indexOf('statistic_id') !== -1,
    );
    await queryRunner.dropForeignKey('site_statistics_history', statisticsHistoryForeignKey);

    const statisticsTranslationsTable = await queryRunner.getTable('site_statistics_translations');
    const statisticsTranslationsForeignKey = statisticsTranslationsTable.foreignKeys.find(
      fk => fk.columnNames.indexOf('statistic_id') !== -1,
    );
    await queryRunner.dropForeignKey('site_statistics_translations', statisticsTranslationsForeignKey);

    // Xóa các bảng
    await queryRunner.dropTable('site_statistics_translations');
    await queryRunner.dropTable('site_statistics_history');
    await queryRunner.dropTable('site_statistics');
    await queryRunner.dropTable('site_statistics_settings');
  }
} 