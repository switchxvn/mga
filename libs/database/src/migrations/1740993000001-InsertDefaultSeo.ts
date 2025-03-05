import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertDefaultSeo1740993000001 implements MigrationInterface {
    name = 'InsertDefaultSeo1740993000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert default SEO for homepage
        await queryRunner.query(`
            INSERT INTO "seo" (
                "title", 
                "description", 
                "og_title", 
                "og_description", 
                "og_image", 
                "keywords", 
                "canonical_url", 
                "page_path", 
                "robots_txt", 
                "is_active", 
                "created_at", 
                "updated_at"
            ) VALUES (
                'Trang chủ | Website của bạn', 
                'Mô tả trang chủ của website của bạn với các thông tin hấp dẫn và thu hút người dùng.',
                'Trang chủ | Website của bạn', 
                'Mô tả trang chủ của website của bạn với các thông tin hấp dẫn và thu hút người dùng.',
                '/images/og-image-home.jpg', 
                'từ khóa 1, từ khóa 2, từ khóa 3, website của bạn', 
                'https://example.com/', 
                '/', 
                'index, follow', 
                TRUE, 
                NOW(), 
                NOW()
            )
        `);

        // Insert default SEO for about page
        await queryRunner.query(`
            INSERT INTO "seo" (
                "title", 
                "description", 
                "og_title", 
                "og_description", 
                "og_image", 
                "keywords", 
                "canonical_url", 
                "page_path", 
                "robots_txt", 
                "is_active", 
                "created_at", 
                "updated_at"
            ) VALUES (
                'Giới thiệu | Website của bạn', 
                'Tìm hiểu thêm về chúng tôi, sứ mệnh và giá trị cốt lõi của chúng tôi.',
                'Giới thiệu | Website của bạn', 
                'Tìm hiểu thêm về chúng tôi, sứ mệnh và giá trị cốt lõi của chúng tôi.',
                '/images/og-image-about.jpg', 
                'giới thiệu, về chúng tôi, sứ mệnh, tầm nhìn, giá trị cốt lõi', 
                'https://example.com/about', 
                '/about', 
                'index, follow', 
                TRUE, 
                NOW(), 
                NOW()
            )
        `);

        // Insert default SEO for contact page
        await queryRunner.query(`
            INSERT INTO "seo" (
                "title", 
                "description", 
                "og_title", 
                "og_description", 
                "og_image", 
                "keywords", 
                "canonical_url", 
                "page_path", 
                "robots_txt", 
                "is_active", 
                "created_at", 
                "updated_at"
            ) VALUES (
                'Liên hệ | Website của bạn', 
                'Liên hệ với chúng tôi để được hỗ trợ và tư vấn về sản phẩm và dịch vụ.',
                'Liên hệ | Website của bạn', 
                'Liên hệ với chúng tôi để được hỗ trợ và tư vấn về sản phẩm và dịch vụ.',
                '/images/og-image-contact.jpg', 
                'liên hệ, hỗ trợ, tư vấn, địa chỉ, email, số điện thoại', 
                'https://example.com/contact', 
                '/contact', 
                'index, follow', 
                TRUE, 
                NOW(), 
                NOW()
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the default SEO entries
        await queryRunner.query(`DELETE FROM "seo" WHERE "page_path" IN ('/', '/about', '/contact')`);
    }
} 