import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNavbarWithLogoAndHotline1742570593300 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get active theme id
    const activeTheme = await queryRunner.query(`
      SELECT id FROM themes WHERE is_active = true LIMIT 1;
    `);

    if (!activeTheme?.length) {
      throw new Error('No active theme found');
    }

    const activeThemeId = activeTheme[0].id;

    await queryRunner.query(`
      INSERT INTO theme_sections (
        theme_id,
        type,
        component_name,
        title,
        "order",
        page_type,
        settings,
        is_active
      ) VALUES (
        ${activeThemeId},
        'navbar_with_logo_hotline',
        'NavbarWithLogoHotline',
        'Navbar with Logo and Hotline',
        0,
        'common',
        '{
          "layout": "three-columns",
          "backgroundColor": "#ffffff",
          "textColor": "#000000",
          "borderColor": "#e5e7eb",
          "logo": {
            "src": "https://s3mga.sgp1.digitaloceanspaces.com/logo-mga.png",
            "alt": "Logo",
            "width": 120,
            "height": 60,
            "darkModeSrc": "https://s3mga.sgp1.digitaloceanspaces.com/logo-mga.png"
          },
          "slogan": {
            "text": "XE NÂNG MGA FORKLIFT LẮP RÁP SKD TẠI VIỆT NAM",
            "subText": "ĐỘNG CƠ ISUZU NHẬP KHẨU NỘI ĐỊA TỪ NHẬT BẢN",
            "fontSize": "lg",
            "fontWeight": "bold",
            "textAlign": "center"
          },
          "hotline": {
            "text": "Tổng đài khách hàng",
            "number": "0917 00 1254",
            "fontSize": "xl",
            "fontWeight": "bold",
            "icon": "phone"
          },
          "containerMaxWidth": "7xl",
          "paddingY": "4",
          "columnGap": "8"
        }'::jsonb,
        true
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM theme_sections 
      WHERE type = 'navbar_with_logo_hotline' 
      AND page_type = 'common'
    `);
  }
}