import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTravelServicesSection1743270380271 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First get the active theme id
    const activeTheme = await queryRunner.query(`
      SELECT id FROM themes WHERE is_active = true LIMIT 1;
    `);

    if (!activeTheme || activeTheme.length === 0) {
      throw new Error('No active theme found. Please ensure there is an active theme before running this migration.');
    }

    const themeId = activeTheme[0].id;

    // Thêm section mới cho dịch vụ du lịch
    await queryRunner.query(`
      INSERT INTO theme_sections (
        theme_id,
        type,
        component_name,
        title,
        "order",
        page_type,
        settings,
        is_active,
        created_at,
        updated_at
      )
      VALUES (
        ${themeId}, -- Use dynamic theme id
        'travel_services',
        'TravelServicesSection',
        'Dịch Vụ Du Lịch',
        10, -- order (điều chỉnh theo nhu cầu)
        'home_page',
        '{
          "layout": "grid",
          "columns": 6,
          "maxItems": 6,
          "showIcon": true,
          "showTitle": true,
          "gap": "2rem",
          "padding": {
            "top": "2rem",
            "bottom": "2rem"
          },
          "iconStyle": {
            "size": "text-5xl",
            "color": "text-primary-500",
            "margin": "mb-3"
          },
          "titleStyle": {
            "size": "text-base",
            "weight": "font-medium",
            "color": "text-primary-500",
            "margin": "mb-1"
          },
          "services": [
            {
              "title": "Giường Nghỉ Qua Đêm",
              "icon": "Bed",
              "price": "99,000 đ/giường mỗi đêm"
            },
            {
              "title": "Gửi Xe Máy",
              "icon": "Bike",
              "price": "10,000 đ"
            },
            {
              "title": "Gửi Xe Ô Tô Dưới 16 Chỗ",
              "icon": "Car",
              "price": "50,000 đ"
            },
            {
              "title": "Gửi Xe 29 Chỗ",
              "icon": "Bus",
              "price": "80,000 đ"
            },
            {
              "title": "Gửi Xe 45 Chỗ",
              "icon": "Bus",
              "price": "100,000 đ"
            },
            {
              "title": "Miễn Phí Xe Điện Đưa Rước",
              "icon": "BatteryCharging",
              "price": "Miễn phí"
            }
          ]
        }',
        true,
        NOW(),
        NOW()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa section mới nếu cần rollback
    await queryRunner.query(`
      DELETE FROM theme_sections
      WHERE type = 'travel_services'
    `);
  }
}