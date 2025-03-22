import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCombinedNavbarSettings1742223537110 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update settings for theme sections with type 'combined_navbar'
    await queryRunner.query(`
      UPDATE theme_sections 
      SET settings = jsonb_set(
        settings,
        '{}'::text[],
        '{
          "headerBackgroundColor": "#feb912",
          "menuBackgroundColor": "#ffffff",
          "textColor": "#000000",
          "borderColor": "#e5e7eb",
          "menuAlignment": "center",
          "showLanguageSwitcher": true,
          "showThemeToggle": true,
          "showCart": true,
          "mobileMenuBreakpoint": "md",
          "slogan": {
            "text": "XE NÂNG MGA FORKLIFT LẮP RÁP SKD TẠI VIỆT NAM",
            "subText": "ĐỘNG CƠ ISUZU NHẬP KHẨU NỘI ĐỊA TỪ NHẬT BẢN",
            "fontSize": "lg",
            "fontWeight": "bold"
          },
          "hotlines": {
            "sales": {
              "text": "Mua hàng",
              "number": "0917 00 1254"
            },
            "support": {
              "text": "Dịch vụ khách hàng",
              "number": "0918 865 060"
            }
          },
          "darkMode": {
            "headerBackgroundColor": "#171717",
            "menuBackgroundColor": "#171717",
            "textColor": "#ffffff",
            "borderColor": "#404040"
          }
        }'::jsonb
      )
      WHERE type = 'combined_navbar'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert settings to previous state
    await queryRunner.query(`
      UPDATE theme_sections 
      SET settings = jsonb_set(
        settings,
        '{}'::text[],
        '{
          "headerBackgroundColor": "#feb912",
          "menuBackgroundColor": "#ffffff",
          "textColor": "#000000",
          "borderColor": "#e5e7eb",
          "menuAlignment": "center",
          "showLanguageSwitcher": true,
          "showThemeToggle": true,
          "showCart": true,
          "slogan": {
            "text": "XE NÂNG MGA FORKLIFT LẮP RÁP SKD TẠI VIỆT NAM",
            "subText": "ĐỘNG CƠ ISUZU NHẬP KHẨU NỘI ĐỊA TỪ NHẬT BẢN",
            "fontSize": "lg",
            "fontWeight": "bold"
          },
          "hotlines": {
            "sales": {
              "text": "Mua hàng",
              "number": "0917 00 1254"
            },
            "support": {
              "text": "Dịch vụ khách hàng",
              "number": "0918 865 060"
            }
          }
        }'::jsonb
      )
      WHERE type = 'combined_navbar'
    `);
  }
} 