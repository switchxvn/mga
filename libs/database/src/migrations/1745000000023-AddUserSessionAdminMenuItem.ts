import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserSessionAdminMenuItem1745000000023 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Thêm menu chính User Session
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
        'user-session', 
        'User Sessions', 
        'mdi-account-group', 
        '/admin/user-session', 
        NULL, 
        110, 
        true, 
        NOW(), 
        NOW()
      )
    `);

    // Lấy ID của menu User Session vừa thêm
    const userSessionMenuResult = await queryRunner.query(`
      SELECT id FROM admin_menu_items WHERE code = 'user-session' LIMIT 1
    `);

    if (userSessionMenuResult && userSessionMenuResult.length > 0) {
      const userSessionMenuId = userSessionMenuResult[0].id;

      // Thêm các menu con
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
        VALUES 
        (
          'user-session-overview', 
          'Overview', 
          'mdi-view-dashboard', 
          '/admin/user-session', 
          ${userSessionMenuId}, 
          1, 
          true, 
          NOW(), 
          NOW()
        ),
        (
          'user-session-sessions', 
          'Sessions', 
          'mdi-account-multiple', 
          '/admin/user-session/sessions', 
          ${userSessionMenuId}, 
          2, 
          true, 
          NOW(), 
          NOW()
        ),
        (
          'user-session-page-visits', 
          'Page Visits', 
          'mdi-file-document', 
          '/admin/user-session/page-visits', 
          ${userSessionMenuId}, 
          3, 
          true, 
          NOW(), 
          NOW()
        ),
        (
          'user-session-analytics', 
          'Analytics', 
          'mdi-chart-bar', 
          '/admin/user-session/analytics', 
          ${userSessionMenuId}, 
          4, 
          true, 
          NOW(), 
          NOW()
        )
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa các menu con trước
    await queryRunner.query(`
      DELETE FROM admin_menu_items WHERE code IN (
        'user-session-overview', 
        'user-session-sessions', 
        'user-session-page-visits', 
        'user-session-analytics'
      )
    `);

    // Xóa menu chính
    await queryRunner.query(`
      DELETE FROM admin_menu_items WHERE code = 'user-session'
    `);
  }
} 