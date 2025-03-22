import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCombinedNavbarHotlineColors1742634565505 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE theme_sections 
            SET settings = jsonb_set(
                jsonb_set(
                    jsonb_set(
                        jsonb_set(
                            settings,
                            '{slogan}',
                            '{"text": "XE NÂNG MGA FORKLIFT LẮP RÁP SKD TẠI VIỆT NAM", "subText": "ĐỘNG CƠ ISUZU NHẬP KHẨU NỘI ĐỊA TỪ NHẬT BẢN", "fontSize": "lg", "fontWeight": "bold"}'::jsonb
                        ),
                        '{hotlines}',
                        '{"sales": {"text": "Mua hàng", "number": "0917 00 1254", "textColor": "#ffffff", "backgroundColor": "#0EA5E9"}, "support": {"text": "Dịch vụ khách hàng", "number": "0918 865 060", "textColor": "#ffffff", "backgroundColor": "#0EA5E9"}}'::jsonb
                    ),
                    '{darkMode,hotlines}',
                    '{"sales": {"text": "Mua hàng", "number": "0917 00 1254", "textColor": "#ffffff", "backgroundColor": "#0EA5E9"}, "support": {"text": "Dịch vụ khách hàng", "number": "0918 865 060", "textColor": "#ffffff", "backgroundColor": "#0EA5E9"}}'::jsonb
                ),
                '{darkMode}',
                '{"headerBackgroundColor": "#171717", "menuBackgroundColor": "#171717", "textColor": "#ffffff", "borderColor": "#404040"}'::jsonb
            )
            WHERE type = 'combined_navbar'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE theme_sections 
            SET settings = jsonb_set(
                settings,
                '{slogan}',
                '{"text": "XE NÂNG MGA FORKLIFT", "subText": "CHẤT LƯỢNG NHẬT BẢN", "fontSize": "lg", "fontWeight": "bold"}'::jsonb
            )
            WHERE type = 'combined_navbar'
        `);
    }

}
