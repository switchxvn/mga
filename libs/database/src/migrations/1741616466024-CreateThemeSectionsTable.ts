import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateThemeSectionsTable1741616466024 implements MigrationInterface {
    name = 'CreateThemeSectionsTable1741616466024'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create theme_sections table
        await queryRunner.query(`
            CREATE TABLE "theme_sections" (
                "id" SERIAL NOT NULL,
                "theme_id" integer NOT NULL,
                "type" character varying(50) NOT NULL,
                "title" character varying(255) NOT NULL,
                "order" integer NOT NULL DEFAULT 0,
                "settings" jsonb NOT NULL DEFAULT '{}',
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_theme_sections" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "theme_sections" 
            ADD CONSTRAINT "FK_theme_sections_theme" 
            FOREIGN KEY ("theme_id") 
            REFERENCES "themes"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION
        `);

        // Insert default sections for each theme
        await queryRunner.query(`
            INSERT INTO theme_sections (
                theme_id,
                type,
                title,
                "order",
                settings,
                is_active
            )
            SELECT 
                id as theme_id,
                'hero' as type,
                'Hero Section' as title,
                0 as "order",
                jsonb_build_object(
                    'height', '600px',
                    'layout', 'split',
                    'sliderPosition', 'right',
                    'videoPosition', 'left',
                    'sliderWidth', '70%',
                    'videoWidth', '30%',
                    'autoplay', true,
                    'interval', 5000,
                    'showDots', true,
                    'showArrows', true
                ) as settings,
                true as is_active
            FROM themes;

            INSERT INTO theme_sections (
                theme_id,
                type,
                title,
                "order",
                settings,
                is_active
            )
            SELECT 
                id as theme_id,
                'featured_products' as type,
                'Sản phẩm nổi bật' as title,
                1 as "order",
                jsonb_build_object(
                    'layout', 'grid',
                    'columns', 4,
                    'showPrice', true,
                    'showRating', true,
                    'maxItems', 8
                ) as settings,
                true as is_active
            FROM themes;

            INSERT INTO theme_sections (
                theme_id,
                type,
                title,
                "order",
                settings,
                is_active
            )
            SELECT 
                id as theme_id,
                'new_products' as type,
                'Sản phẩm mới' as title,
                2 as "order",
                jsonb_build_object(
                    'layout', 'slider',
                    'itemsPerView', 4,
                    'autoplay', true,
                    'interval', 3000,
                    'showPrice', true,
                    'showRating', true,
                    'maxItems', 12
                ) as settings,
                true as is_active
            FROM themes;

            INSERT INTO theme_sections (
                theme_id,
                type,
                title,
                "order",
                settings,
                is_active
            )
            SELECT 
                id as theme_id,
                'categories' as type,
                'Danh mục sản phẩm' as title,
                3 as "order",
                jsonb_build_object(
                    'layout', 'grid',
                    'columns', 4,
                    'showDescription', true,
                    'maxItems', 8
                ) as settings,
                true as is_active
            FROM themes;
        `);

        // Drop old columns
        await queryRunner.query(`
            ALTER TABLE "themes" 
            DROP COLUMN IF EXISTS "homepage_layout",
            DROP COLUMN IF EXISTS "slider_config"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add back homepage_layout and slider_config columns
        await queryRunner.query(`
            ALTER TABLE "themes" 
            ADD COLUMN "homepage_layout" jsonb DEFAULT '{"sections": []}'::jsonb,
            ADD COLUMN "slider_config" jsonb DEFAULT '{"items": []}'::jsonb
        `);

        // Migrate non-slider sections back to homepage_layout
        await queryRunner.query(`
            WITH section_data AS (
                SELECT 
                    theme_id,
                    jsonb_agg(
                        jsonb_build_object(
                            'type', type,
                            'title', title,
                            'order', "order",
                            'settings', settings
                        ) ORDER BY "order"
                    ) as sections
                FROM theme_sections
                WHERE type != 'hero'
                GROUP BY theme_id
            )
            UPDATE themes t
            SET homepage_layout = jsonb_build_object('sections', COALESCE(s.sections, '[]'::jsonb))
            FROM section_data s
            WHERE t.id = s.theme_id
        `);

        // Migrate hero section data back to slider_config
        await queryRunner.query(`
            WITH hero_data AS (
                SELECT 
                    theme_id,
                    settings->'items' as items
                FROM theme_sections
                WHERE type = 'hero'
            )
            UPDATE themes t
            SET slider_config = jsonb_build_object('items', COALESCE(h.items, '[]'::jsonb))
            FROM hero_data h
            WHERE t.id = h.theme_id
        `);

        // Drop theme_sections table
        await queryRunner.query(`
            ALTER TABLE "theme_sections" DROP CONSTRAINT "FK_theme_sections_theme"
        `);
        await queryRunner.query(`DROP TABLE "theme_sections"`);
    }
} 