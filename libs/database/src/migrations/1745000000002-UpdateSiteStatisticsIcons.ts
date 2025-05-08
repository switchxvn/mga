import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSiteStatisticsIcons1745000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Cập nhật icon sử dụng Lucide icons
    await queryRunner.query(`
      UPDATE site_statistics 
      SET icon = 'Eye' 
      WHERE key = 'total_visits'
    `);

    await queryRunner.query(`
      UPDATE site_statistics 
      SET icon = 'CalendarDays' 
      WHERE key = 'daily_visits'
    `);

    await queryRunner.query(`
      UPDATE site_statistics 
      SET icon = 'Users' 
      WHERE key = 'online_users'
    `);

    await queryRunner.query(`
      UPDATE site_statistics 
      SET icon = 'UserCircle' 
      WHERE key = 'total_registered_users'
    `);

    await queryRunner.query(`
      UPDATE site_statistics 
      SET icon = 'Clock' 
      WHERE key = 'total_time_spent'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Khôi phục icon cũ
    await queryRunner.query(`
      UPDATE site_statistics 
      SET icon = 'ph:eye' 
      WHERE key = 'total_visits'
    `);

    await queryRunner.query(`
      UPDATE site_statistics 
      SET icon = 'ph:calendar-day' 
      WHERE key = 'daily_visits'
    `);

    await queryRunner.query(`
      UPDATE site_statistics 
      SET icon = 'ph:users' 
      WHERE key = 'online_users'
    `);

    await queryRunner.query(`
      UPDATE site_statistics 
      SET icon = 'ph:user-circle' 
      WHERE key = 'total_registered_users'
    `);

    await queryRunner.query(`
      UPDATE site_statistics 
      SET icon = 'ph:clock' 
      WHERE key = 'total_time_spent'
    `);
  }
} 