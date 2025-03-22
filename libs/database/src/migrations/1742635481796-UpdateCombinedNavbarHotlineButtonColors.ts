import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCombinedNavbarHotlineButtonColors1742635481796 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE theme_sections 
            SET settings = settings || '{
                "slogan": {
                    "text": "XE NÂNG MGA FORKLIFT LẮP RÁP SKD TẠI VIỆT NAM",
                    "subText": "ĐỘNG CƠ ISUZU NHẬP KHẨU NỘI ĐỊA TỪ NHẬT BẢN",
                    "fontSize": "lg",
                    "fontWeight": "bold"
                },
                "darkMode": {
                    "headerBackgroundColor": "#171717",
                    "menuBackgroundColor": "#171717",
                    "textColor": "#ffffff",
                    "borderColor": "#404040"
                },
                "hotlines": {
                    "sales": {
                        "text": "Mua hàng",
                        "number": "0917 00 1254",
                        "textColor": "#ffffff",
                        "backgroundColor": "var(--tertiary-500)"
                    },
                    "support": {
                        "text": "Dịch vụ khách hàng",
                        "number": "0918 865 060",
                        "textColor": "#ffffff",
                        "backgroundColor": "var(--tertiary-500)"
                    }
                },
                "showCart": true,
                "textColor": "#000000",
                "borderColor": "#e5e7eb",
                "menuAlignment": "center",
                "showThemeToggle": true,
                "menuBackgroundColor": "#ffffff",
                "showLanguageSwitcher": true,
                "headerBackgroundColor": "#feb912"
            }'::jsonb
            WHERE type = 'combined_navbar'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE theme_sections 
            SET settings = settings || '{
                "hotlines": {
                    "sales": {
                        "text": "Mua hàng",
                        "number": "0917 00 1254",
                        "textColor": "#ffffff",
                        "backgroundColor": "#0EA5E9"
                    },
                    "support": {
                        "text": "Dịch vụ khách hàng",
                        "number": "0918 865 060",
                        "textColor": "#ffffff",
                        "backgroundColor": "#0EA5E9"
                    }
                }
            }'::jsonb
            WHERE type = 'combined_navbar'
        `);
    }

}
