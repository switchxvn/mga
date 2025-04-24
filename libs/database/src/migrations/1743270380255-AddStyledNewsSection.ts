import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStyledNewsSection1743270380255 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Get active theme id
        const activeTheme = await queryRunner.query(`
            SELECT id FROM themes WHERE is_active = true LIMIT 1;
        `);
        const themeId = activeTheme[0].id;

        await queryRunner.query(`
            INSERT INTO theme_sections (
                type,
                title,
                "order",
                "page_type", 
                "component_name",
                settings,
                "is_active",
                "theme_id",
                "created_at",
                "updated_at"
            ) VALUES (
                'styled_news',
                'Tin tức mới nhất',
                100,
                'home_page',
                'StyledNewsSection',
                '{
                    "title": "Tin tức mới nhất",
                    "layout": "slider", 
                    "maxItems": 8,
                    "showButton": true,
                    "buttonText": "Xem tất cả",
                    "buttonStyle": "solid",
                    "gap": "1rem",
                    "slidesPerView": {
                        "desktop": 4,
                        "tablet": 2,
                        "mobile": 1
                    },
                    "autoplay": true,
                    "interval": 5000,
                    "showDots": true,
                    "showArrows": true,
                    "displayMode": "slider",
                    "fontSize": {
                        "title": "text-2xl",
                        "description": "text-base"
                    },
                    "useUppercase": true,
                    "colors": {
                        "title": "text-gray-900 dark:text-white",
                        "description": "text-gray-600 dark:text-gray-400"
                    },
                    "alignment": {
                        "header": "justify-between",
                        "content": "text-left",
                        "container": "items-start"
                    }
                }'::jsonb,
                true,
                $1,
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            );
        `, [themeId]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM theme_sections 
            WHERE type = 'styled_news' 
            AND "component_name" = 'StyledNewsSection';
        `);
    }
}