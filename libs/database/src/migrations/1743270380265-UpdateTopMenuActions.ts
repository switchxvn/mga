import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTopMenuActions1743270380265 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update theme_sections to include top menu actions
        await queryRunner.query(`
            UPDATE "theme_sections"
            SET "settings" = jsonb_set(
                COALESCE("settings", '{}'::jsonb),
                '{topMenu}',
                jsonb_build_object(
                    'links', COALESCE("settings"->'topMenu'->'links', '[]'::jsonb),
                    'actions', '[
                        {
                            "label": "Trang chủ",
                            "href": "/",
                            "textColor": "#ffffff",
                            "hoverColor": "#ffffff",
                            "isTranslated": false
                        },
                        {
                            "label": "Giờ hoạt động 24/24",
                            "href": "#",
                            "textColor": "#ffffff",
                            "hoverColor": "#ffffff",
                            "isTranslated": false
                        }
                    ]'::jsonb
                )
            )
            WHERE "type" = 'simple_navbar';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove top menu actions from theme_sections
        await queryRunner.query(`
            UPDATE "theme_sections"
            SET "settings" = jsonb_set(
                COALESCE("settings", '{}'::jsonb),
                '{topMenu}',
                jsonb_build_object(
                    'links', COALESCE("settings"->'topMenu'->'links', '[]'::jsonb)
                )
            )
            WHERE "type" = 'simple_navbar';
        `);
    }
} 