import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCombinedNavbarSettings1743270380248 implements MigrationInterface {
    name = 'UpdateCombinedNavbarSettings1743270380248'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update settings for CombinedNavbar section
        await queryRunner.query(`
            UPDATE theme_sections 
            SET settings = jsonb_set(
                settings,
                '{topMenu}',
                '{"links": [
                    {
                        "href": "/danh-muc-san-pham/phu-tung-xe-nang",
                        "label": "forklift_accessories",
                        "textColor": "rgb(var(--tertiary-500))",
                        "hoverColor": "var(--primary-500)"
                    },
                    {
                        "href": "/bai-viet?danh-muc=du-an-mga",
                        "label": "mga_projects",
                        "textColor": "rgb(var(--tertiary-500))",
                        "hoverColor": "var(--primary-500)"
                    }
                ]}'::jsonb
            )
            WHERE type = 'combined_navbar';
        `);

        // Update other settings
        await queryRunner.query(`
            UPDATE theme_sections 
            SET settings = jsonb_set(
                settings,
                '{slogan,hotlines,navigation,darkMode}',
                '{"slogan": {"text": "XE NÂNG MGA FORKLIFT LẮP RÁP SKD TẠI VIỆT NAM", "subText": "ĐỘNG CƠ ISUZU NHẬP KHẨU NỘI ĐỊA TỪ NHẬT BẢN", "fontSize": "lg", "fontWeight": "bold", "additionalText": "BÁN VÀ CHO THUÊ GIÁ TỐT NHẤT"}, "darkMode": {"textColor": "#ffffff", "borderColor": "#404040", "menuBackgroundColor": "#171717", "headerBackgroundColor": "#171717"}, "hotlines": {"sales": {"text": "Mua hàng", "number": "0917 00 1254", "textColor": "#ffffff", "backgroundColor": "var(--tertiary-500)"}, "support": {"text": "Dịch vụ khách hàng", "number": "0918 865 060", "textColor": "#ffffff", "backgroundColor": "var(--tertiary-500)"}}, "showCart": true, "textColor": "#ffffff", "navigation": {"textColor": "#ffffff", "fontWeight": "medium", "activeTextColor": "var(--primary-500)"}, "borderColor": "#e5e7eb", "menuAlignment": "center", "showThemeToggle": true, "menuBackgroundColor": "var(--tertiary-500)", "showLanguageSwitcher": true, "headerBackgroundColor": "var(--tertiary-500)"}'::jsonb
            )
            WHERE type = 'combined_navbar';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert settings
        await queryRunner.query(`
            UPDATE theme_sections 
            SET settings = settings - 'topMenu'
            WHERE type = 'combined_navbar';
        `);

        // Revert other settings to default
        await queryRunner.query(`
            UPDATE theme_sections 
            SET settings = jsonb_set(
                settings,
                '{slogan,hotlines,navigation,darkMode}',
                '{"slogan": {"text": "", "subText": "", "fontSize": "lg", "fontWeight": "bold"}, "darkMode": {"textColor": "#ffffff", "borderColor": "#404040", "menuBackgroundColor": "#171717", "headerBackgroundColor": "#171717"}, "hotlines": {"sales": {"text": "", "number": ""}, "support": {"text": "", "number": ""}}, "showCart": true, "textColor": "#000000", "navigation": {"textColor": "#000000", "fontWeight": "medium", "activeTextColor": "var(--primary-500)"}, "borderColor": "#e5e7eb", "menuAlignment": "center", "showThemeToggle": true, "menuBackgroundColor": "#ffffff", "showLanguageSwitcher": true, "headerBackgroundColor": "#ffffff"}'::jsonb
            )
            WHERE type = 'combined_navbar';
        `);
    }
} 