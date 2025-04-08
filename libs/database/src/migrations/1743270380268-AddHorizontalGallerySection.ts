import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHorizontalGallerySection1743270380268 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const theme = await queryRunner.query(`
            SELECT id FROM themes WHERE is_active = true
        `);
        if (!theme || theme.length === 0) {
            throw new Error('No active theme found');
        }
        const themeId = theme[0].id;
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
            ) VALUES (
                ${themeId},
                'horizontal_gallery',
                'HorizontalGallerySection',
                'Horizontal Gallery Section',
                2,
                'home_page',
                '{
                    "layout": "horizontal",
                    "columns": {
                        "sm": 1,
                        "md": 2,
                        "lg": 3,
                        "xl": 4
                    },
                    "gap": "1rem",
                    "padding": {
                        "top": "4rem",
                        "bottom": "4rem"
                    },
                    "maxItems": 12,
                    "showTitle": true,
                    "showDescription": true,
                    "titleAlignment": "center",
                    "colors": {
                        "title": "text-gray-900 dark:text-white",
                        "description": "text-gray-600 dark:text-gray-400",
                        "background": "bg-white dark:bg-gray-900"
                    },
                    "imageHoverEffect": "zoom",
                    "swiperSettings": {
                        "autoplay": true,
                        "interval": 5000,
                        "slidesPerView": 3,
                        "rows": 3
                    }
                }',
                true,
                NOW(),
                NOW()
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM theme_sections 
            WHERE type = 'horizontal_gallery' 
            AND component_name = 'HorizontalGallerySection';
        `);
    }
} 