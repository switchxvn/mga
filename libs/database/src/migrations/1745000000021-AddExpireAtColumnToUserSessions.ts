import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddExpireAtColumnToUserSessions1745000000021 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Kiểm tra xem cột expire_at đã tồn tại trong bảng chưa
    const table = await queryRunner.getTable('user_sessions');
    const expireAtColumn = table?.findColumnByName('expire_at');

    if (!expireAtColumn) {
      // Thêm cột expire_at nếu nó chưa tồn tại
      await queryRunner.addColumn(
        'user_sessions',
        new TableColumn({
          name: 'expire_at',
          type: 'timestamp',
          isNullable: true,
        })
      );
      
      console.log('Added expire_at column to user_sessions table');
    } else {
      console.log('expire_at column already exists in user_sessions table');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Kiểm tra xem cột expire_at có tồn tại trong bảng không
    const table = await queryRunner.getTable('user_sessions');
    const expireAtColumn = table?.findColumnByName('expire_at');

    if (expireAtColumn) {
      // Xóa cột expire_at nếu nó tồn tại
      await queryRunner.dropColumn('user_sessions', 'expire_at');
      console.log('Dropped expire_at column from user_sessions table');
    }
  }
} 