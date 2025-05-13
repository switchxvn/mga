import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserSessionAdminMenuItems1745000000024 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Cập nhật menu chính User Session
    await queryRunner.query(`
      UPDATE admin_menu_items 
      SET 
        icon = 'users',
        path = '/user-session'
      WHERE code = 'user-session'
    `);

    // Xóa menu Sessions
    await queryRunner.query(`
      DELETE FROM admin_menu_items 
      WHERE code = 'user-session-sessions'
    `);

    // Cập nhật các menu con còn lại
    await queryRunner.query(`
      UPDATE admin_menu_items 
      SET 
        icon = 'layout-dashboard',
        path = '/user-session'
      WHERE code = 'user-session-overview'
    `);

    await queryRunner.query(`
      UPDATE admin_menu_items 
      SET 
        icon = 'file-text',
        path = '/user-session/page-visits'
      WHERE code = 'user-session-page-visits'
    `);

    await queryRunner.query(`
      UPDATE admin_menu_items 
      SET 
        icon = 'bar-chart',
        path = '/user-session/analytics'
      WHERE code = 'user-session-analytics'
    `);

    // Cập nhật lại thứ tự của các menu con sau khi xóa menu Sessions
    await queryRunner.query(`
      UPDATE admin_menu_items 
      SET "order" = 2
      WHERE code = 'user-session-page-visits'
    `);

    await queryRunner.query(`
      UPDATE admin_menu_items 
      SET "order" = 3
      WHERE code = 'user-session-analytics'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Khôi phục menu chính User Session
    await queryRunner.query(`
      UPDATE admin_menu_items 
      SET 
        icon = 'mdi-account-group',
        path = '/admin/user-session'
      WHERE code = 'user-session'
    `);

    // Khôi phục các menu con
    await queryRunner.query(`
      UPDATE admin_menu_items 
      SET 
        icon = 'mdi-view-dashboard',
        path = '/admin/user-session'
      WHERE code = 'user-session-overview'
    `);

    // Khôi phục menu Sessions đã bị xóa
    const userSessionMenuResult = await queryRunner.query(`
      SELECT id FROM admin_menu_items WHERE code = 'user-session' LIMIT 1
    `);

    if (userSessionMenuResult && userSessionMenuResult.length > 0) {
      const userSessionMenuId = userSessionMenuResult[0].id;

      await queryRunner.query(`
        INSERT INTO admin_menu_items (
          code, 
          name, 
          icon, 
          path, 
          parent_id, 
          "order", 
          is_active, 
          created_at, 
          updated_at
        )
        VALUES (
          'user-session-sessions', 
          'Sessions', 
          'mdi-account-multiple', 
          '/admin/user-session/sessions', 
          ${userSessionMenuId}, 
          2, 
          true, 
          NOW(), 
          NOW()
        )
      `);
    }

    // Khôi phục các menu con còn lại
    await queryRunner.query(`
      UPDATE admin_menu_items 
      SET 
        icon = 'mdi-file-document',
        path = '/admin/user-session/page-visits',
        "order" = 3
      WHERE code = 'user-session-page-visits'
    `);

    await queryRunner.query(`
      UPDATE admin_menu_items 
      SET 
        icon = 'mdi-chart-bar',
        path = '/admin/user-session/analytics',
        "order" = 4
      WHERE code = 'user-session-analytics'
    `);
  }
} 