import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSimpleNavbarSection1743270380249 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get active theme id
    const activeTheme = await queryRunner.query(`
      SELECT id FROM themes WHERE is_active = true LIMIT 1;
    `);

    if (!activeTheme?.length) {
      throw new Error('No active theme found');
    }

    const activeThemeId = activeTheme[0].id;

    // Insert new simple navbar section
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
        'simple_navbar',
        'Simple Navbar',
        'common',
        false,
        1,
        '{
          "menuBackgroundColor": "#ffffff",
          "textColor": "#000000",
          "borderColor": "#e5e7eb",
          "menuAlignment": "center",
          "showLanguageSwitcher": true,
          "showThemeToggle": true,
          "showCart": true,
          "mobileMenuBreakpoint": "md",
          "darkMode": {
            "menuBackgroundColor": "#171717",
            "textColor": "#ffffff",
            "borderColor": "#404040"
          },
          "navigation": {
            "textColor": "var(--tertiary-500)",
            "fontWeight": "semibold",
            "activeTextColor": "var(--primary-500)"
          },
          "topMenu": {
            "links": [
              {
                "label": "Tuyển dụng",
                "href": "/recruitment",
                "textColor": "#4B5563",
                "hoverColor": "#2563EB",
                "isTranslated": true
              },
              {
                "label": "Liên hệ",
                "href": "/contact",
                "textColor": "#4B5563",
                "hoverColor": "#2563EB",
                "isTranslated": true
              }
            ]
          }
        }',
        NOW(),
        NOW(),
        ${activeThemeId}
      )
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

    // Delete simple navbar section
    await queryRunner.query(`
      DELETE FROM theme_sections 
      WHERE "type" = 'simple_navbar'
      AND "theme_id" = ${activeThemeId}
    `);
  }
} 