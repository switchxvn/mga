import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHeroVideoAndThemeRelations1741615987489 implements MigrationInterface {
    name = 'AddHeroVideoAndThemeRelations1741615987489'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add theme_id to hero_slider
        await queryRunner.query(`ALTER TABLE "hero_slider" ADD "theme_id" integer`);
        await queryRunner.query(`ALTER TABLE "hero_slider" ADD CONSTRAINT "FK_hero_slider_theme" FOREIGN KEY ("theme_id") REFERENCES "themes"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);

        // Create hero_videos table
        await queryRunner.query(`CREATE TABLE "hero_videos" (
            "id" SERIAL NOT NULL,
            "title" character varying(255) NOT NULL,
            "description" text,
            "video_url" character varying(255) NOT NULL,
            "thumbnail_url" character varying(255),
            "link" character varying(255),
            "is_active" boolean NOT NULL DEFAULT true,
            "order" integer NOT NULL DEFAULT 0,
            "theme_id" integer,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_hero_videos" PRIMARY KEY ("id")
        )`);

        // Add foreign key for theme_id in hero_videos
        await queryRunner.query(`ALTER TABLE "hero_videos" ADD CONSTRAINT "FK_hero_videos_theme" FOREIGN KEY ("theme_id") REFERENCES "themes"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);

        // Insert sample theme
        await queryRunner.query(`
            INSERT INTO "themes" (name, is_active) 
            VALUES ('Default Theme', true) 
            RETURNING id
        `).then(async ([{ id: themeId }]) => {
            // Insert sample hero sliders
            await queryRunner.query(`
                INSERT INTO "hero_slider" 
                (title, description, image_url, button_text, button_link, is_active, "order", theme_id) 
                VALUES 
                ('Thời Trang Mùa Hè 2024', 'Khám phá bộ sưu tập mới với nhiều ưu đãi hấp dẫn', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070', 'Mua Ngay', '/collections/summer-2024', true, 1, ${themeId}),
                ('Phong Cách Sống Năng Động', 'Trang phục thể thao & đời sống', 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070', 'Khám Phá', '/collections/active-wear', true, 2, ${themeId}),
                ('Xu Hướng Thời Trang', 'Bộ sưu tập độc quyền từ các nhà thiết kế', 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071', 'Xem Ngay', '/collections/trending', true, 3, ${themeId})
            `);

            // Insert sample hero videos
            await queryRunner.query(`
                INSERT INTO "hero_videos" 
                (title, description, video_url, thumbnail_url, link, is_active, "order", theme_id) 
                VALUES 
                ('Bộ Sưu Tập Xuân Hè', 'Khám phá các xu hướng thời trang mới nhất', 'https://player.vimeo.com/video/128373915', 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=2070', '/collections/spring-summer', true, 1, ${themeId}),
                ('Phong Cách Công Sở', 'Trang phục thanh lịch cho người hiện đại', 'https://player.vimeo.com/video/128373915', 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=2073', '/collections/office-wear', true, 2, ${themeId}),
                ('Thời Trang Bền Vững', 'Góp phần bảo vệ môi trường với thời trang xanh', 'https://player.vimeo.com/video/128373915', 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?q=80&w=2070', '/collections/sustainable', true, 3, ${themeId})
            `);
        });
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Delete sample data first
        await queryRunner.query(`DELETE FROM "hero_videos"`);
        await queryRunner.query(`DELETE FROM "hero_slider" WHERE theme_id IS NOT NULL`);
        
        // Remove foreign keys
        await queryRunner.query(`ALTER TABLE "hero_videos" DROP CONSTRAINT "FK_hero_videos_theme"`);
        await queryRunner.query(`ALTER TABLE "hero_slider" DROP CONSTRAINT "FK_hero_slider_theme"`);

        // Drop hero_videos table
        await queryRunner.query(`DROP TABLE "hero_videos"`);

        // Remove theme_id from hero_slider
        await queryRunner.query(`ALTER TABLE "hero_slider" DROP COLUMN "theme_id"`);
    }
} 