import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductCategories1741364464514 implements MigrationInterface {
    name = 'AddProductCategories1741364464514'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Thêm các danh mục sản phẩm
        await queryRunner.query(`
            INSERT INTO "categories" ("name", "slug", "description", "active", "is_featured", "meta_title", "meta_description", "meta_keywords", "created_at", "updated_at")
            VALUES 
            ('Điện thoại', 'dien-thoai', 'Danh mục các sản phẩm điện thoại di động', TRUE, TRUE, 'Điện thoại chính hãng', 'Mua điện thoại chính hãng với giá tốt nhất', 'điện thoại, smartphone, mobile', NOW(), NOW()),
            ('Laptop', 'laptop', 'Danh mục các sản phẩm laptop', TRUE, TRUE, 'Laptop chính hãng', 'Mua laptop chính hãng với giá tốt nhất', 'laptop, notebook, máy tính xách tay', NOW(), NOW()),
            ('Máy tính bảng', 'may-tinh-bang', 'Danh mục các sản phẩm máy tính bảng', TRUE, FALSE, 'Máy tính bảng chính hãng', 'Mua máy tính bảng chính hãng với giá tốt nhất', 'máy tính bảng, tablet, ipad', NOW(), NOW()),
            ('Phụ kiện', 'phu-kien', 'Danh mục các sản phẩm phụ kiện điện tử', TRUE, TRUE, 'Phụ kiện điện tử chính hãng', 'Mua phụ kiện điện tử chính hãng với giá tốt nhất', 'phụ kiện, accessory, tai nghe, sạc', NOW(), NOW()),
            ('Đồng hồ thông minh', 'dong-ho-thong-minh', 'Danh mục các sản phẩm đồng hồ thông minh', TRUE, FALSE, 'Đồng hồ thông minh chính hãng', 'Mua đồng hồ thông minh chính hãng với giá tốt nhất', 'đồng hồ thông minh, smartwatch, apple watch', NOW(), NOW())
        `);

        // Lấy ID của các danh mục vừa thêm
        const categories = await queryRunner.query(`SELECT id FROM "categories" WHERE "slug" IN ('dien-thoai', 'laptop', 'may-tinh-bang', 'phu-kien', 'dong-ho-thong-minh')`);
        
        // Lấy ID của các sản phẩm hiện có
        const products = await queryRunner.query(`SELECT id FROM "products" LIMIT 10`);
        
        // Nếu có sản phẩm, thêm liên kết giữa sản phẩm và danh mục
        if (products && products.length > 0 && categories && categories.length > 0) {
            // Thêm một số sản phẩm vào danh mục Điện thoại
            if (categories[0] && products.slice(0, 3).length > 0) {
                for (const product of products.slice(0, 3)) {
                    await queryRunner.query(`
                        INSERT INTO "product_categories" ("product_id", "category_id")
                        VALUES (${product.id}, ${categories[0].id})
                    `);
                }
            }
            
            // Thêm một số sản phẩm vào danh mục Laptop
            if (categories[1] && products.slice(3, 6).length > 0) {
                for (const product of products.slice(3, 6)) {
                    await queryRunner.query(`
                        INSERT INTO "product_categories" ("product_id", "category_id")
                        VALUES (${product.id}, ${categories[1].id})
                    `);
                }
            }
            
            // Thêm một số sản phẩm vào danh mục Phụ kiện
            if (categories[3] && products.slice(6, 10).length > 0) {
                for (const product of products.slice(6, 10)) {
                    await queryRunner.query(`
                        INSERT INTO "product_categories" ("product_id", "category_id")
                        VALUES (${product.id}, ${categories[3].id})
                    `);
                }
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa liên kết giữa sản phẩm và danh mục
        await queryRunner.query(`DELETE FROM "product_categories" WHERE "category_id" IN (SELECT id FROM "categories" WHERE "slug" IN ('dien-thoai', 'laptop', 'may-tinh-bang', 'phu-kien', 'dong-ho-thong-minh'))`);
        
        // Xóa các danh mục đã thêm
        await queryRunner.query(`DELETE FROM "categories" WHERE "slug" IN ('dien-thoai', 'laptop', 'may-tinh-bang', 'phu-kien', 'dong-ho-thong-minh')`);
    }
}
