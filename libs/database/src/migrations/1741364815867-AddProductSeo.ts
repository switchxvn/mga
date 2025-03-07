import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductSeo1741364815867 implements MigrationInterface {
    name = 'AddProductSeo1741364815867'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Thêm dữ liệu SEO cho trang sản phẩm
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
                'Sản phẩm chính hãng với giá tốt nhất', 
                'Khám phá bộ sưu tập sản phẩm đa dạng của chúng tôi với giá cả cạnh tranh và chất lượng đảm bảo. Giao hàng nhanh chóng toàn quốc.',
                'Sản phẩm chính hãng - Giá tốt nhất thị trường', 
                'Mua sắm sản phẩm chính hãng với giá tốt nhất, bảo hành chính hãng và giao hàng nhanh chóng toàn quốc.',
                '/images/og-products.jpg', 
                'sản phẩm, chính hãng, giá tốt, mua sắm, điện thoại, laptop, phụ kiện', 
                '/products', 
                '/products', 
                'index, follow', 
                TRUE, 
                NOW(), 
                NOW()
            )
        `);

        // Thêm dữ liệu SEO cho trang sản phẩm theo danh mục
        const categories = await queryRunner.query(`SELECT id, slug, name FROM "categories" WHERE "slug" IN ('dien-thoai', 'laptop', 'may-tinh-bang', 'phu-kien', 'dong-ho-thong-minh')`);
        
        if (categories && categories.length > 0) {
            for (const category of categories) {
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
                        '${category.name} chính hãng - Giá tốt nhất', 
                        'Mua ${category.name.toLowerCase()} chính hãng với giá tốt nhất, bảo hành dài hạn và giao hàng nhanh chóng toàn quốc.',
                        '${category.name} chính hãng - Giá tốt nhất thị trường', 
                        'Mua sắm ${category.name.toLowerCase()} chính hãng với giá tốt nhất, bảo hành chính hãng và giao hàng nhanh chóng toàn quốc.',
                        '/images/og-${category.slug}.jpg', 
                        '${category.name.toLowerCase()}, chính hãng, giá tốt, mua sắm', 
                        '/products?categories=${category.id}', 
                        '/products/category/${category.slug}', 
                        'index, follow', 
                        TRUE, 
                        NOW(), 
                        NOW()
                    )
                `);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa dữ liệu SEO cho trang sản phẩm theo danh mục
        const categories = await queryRunner.query(`SELECT slug FROM "categories" WHERE "slug" IN ('dien-thoai', 'laptop', 'may-tinh-bang', 'phu-kien', 'dong-ho-thong-minh')`);
        
        if (categories && categories.length > 0) {
            for (const category of categories) {
                await queryRunner.query(`DELETE FROM "seo" WHERE "page_path" = '/products/category/${category.slug}'`);
            }
        }

        // Xóa dữ liệu SEO cho trang sản phẩm chính
        await queryRunner.query(`DELETE FROM "seo" WHERE "page_path" = '/products'`);
    }
}
