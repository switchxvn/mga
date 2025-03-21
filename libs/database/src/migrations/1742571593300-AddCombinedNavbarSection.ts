import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCombinedNavbarSection1742571593300 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get active theme id
    const activeTheme = await queryRunner.query(`
      SELECT id FROM themes WHERE is_active = true LIMIT 1;
    `);

    if (!activeTheme?.length) {
      throw new Error('No active theme found');
    }

    const activeThemeId = activeTheme[0].id;

    // Insert new combined navbar section
    await queryRunner.query(`
      INSERT INTO theme_sections (
        "type",
        "title",
        "page_type",
        "is_active",
        "order",
        "settings",
        "created_at",
        "updated_at",
        "theme_id"
      ) VALUES (
        'combined_navbar',
        'Combined Navbar',
        'common',
        true,
        1,
        '{
          "backgroundColor": "#ffffff",
          "textColor": "#000000",
          "borderColor": "#e5e7eb",
          "menuAlignment": "center",
          "showLanguageSwitcher": true,
          "showThemeToggle": true,
          "showCart": true,
          "logo": {
            "src": "/images/logo.png",
            "alt": "Logo",
            "width": 120,
            "height": 60,
            "darkModeSrc": "/images/logo-dark.png"
          },
          "slogan": {
            "text": "XE NÂNG MGA FORKLIFT LẮP RÁP SKD TẠI VIỆT NAM",
            "subText": "ĐỘNG CƠ ISUZU NHẬP KHẨU NỘI ĐỊA TỪ NHẬT BẢN",
            "fontSize": "lg",
            "fontWeight": "bold"
          },
          "hotlines": {
            "sales": {
              "text": "Mua hàng",
              "number": "0901.20.30.70"
            },
            "support": {
              "text": "Hỗ trợ kỹ thuật",
              "number": "028.3620.80.81"
            }
          }
        }',
        NOW(),
        NOW(),
        ${activeThemeId}
      )
    `);

    // Deactivate old navbar sections
    await queryRunner.query(`
      UPDATE theme_sections 
      SET "is_active" = false 
      WHERE "type" IN ('navbar_without_logo', 'navbar_with_logo_hotline')
      AND "theme_id" = ${activeThemeId}
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Get active theme id
    const activeTheme = await queryRunner.query(`
      SELECT id FROM themes WHERE is_active = true LIMIT 1;
    `);

    if (!activeTheme?.length) {
      throw new Error('No active theme found');
    }

    const activeThemeId = activeTheme[0].id;

    // Reactivate old navbar sections
    await queryRunner.query(`
      UPDATE theme_sections 
      SET "is_active" = true 
      WHERE "type" IN ('navbar_without_logo', 'navbar_with_logo_hotline')
      AND "theme_id" = ${activeThemeId}
    `);

    // Delete combined navbar section
    await queryRunner.query(`
      DELETE FROM theme_sections 
      WHERE "type" = 'combined_navbar'
      AND "theme_id" = ${activeThemeId}
    `);
  }
}