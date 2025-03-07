import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedProductData1741366264419 implements MigrationInterface {
    name = 'SeedProductData1741366264419'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Thêm một số danh mục sản phẩm demo
        await queryRunner.query(`
            INSERT INTO categories (name, slug, description, active, is_featured, category_type)
            VALUES 
            ('Điện thoại', 'dien-thoai', 'Các loại điện thoại di động', true, true, 'product'),
            ('Laptop', 'laptop', 'Máy tính xách tay các loại', true, true, 'product'),
            ('Máy tính bảng', 'may-tinh-bang', 'Các loại máy tính bảng', true, false, 'product'),
            ('Phụ kiện', 'phu-kien', 'Phụ kiện điện thoại, máy tính', true, true, 'product'),
            ('Đồng hồ thông minh', 'dong-ho-thong-minh', 'Các loại đồng hồ thông minh', true, false, 'product')
        `);

        // Thêm từng sản phẩm riêng lẻ và lấy ID trả về
        // iPhone 14 Pro Max
        const iphone14Result = await queryRunner.query(`
            INSERT INTO products (sku, price, compare_price, thumbnail, gallery, published, quantity, is_featured, is_new, is_sale, slug, created_at, updated_at)
            VALUES ('IP14PM', 28990000, 32990000, '/images/products/iphone-14-pro-max.jpg', '["images/products/iphone-14-pro-max-1.jpg", "images/products/iphone-14-pro-max-2.jpg"]', true, 50, true, true, true, 'iphone-14-pro-max', NOW(), NOW())
            RETURNING id
        `);
        const iphone14Id = iphone14Result[0].id;

        // iPhone 13
        const iphone13Result = await queryRunner.query(`
            INSERT INTO products (sku, price, compare_price, thumbnail, gallery, published, quantity, is_featured, is_new, is_sale, slug, created_at, updated_at)
            VALUES ('IP13', 18990000, 22990000, '/images/products/iphone-13.jpg', '["images/products/iphone-13-1.jpg", "images/products/iphone-13-2.jpg"]', true, 30, true, false, true, 'iphone-13', NOW(), NOW())
            RETURNING id
        `);
        const iphone13Id = iphone13Result[0].id;

        // MacBook Air M2
        const macbookAirResult = await queryRunner.query(`
            INSERT INTO products (sku, price, compare_price, thumbnail, gallery, published, quantity, is_featured, is_new, is_sale, slug, created_at, updated_at)
            VALUES ('MBAM2', 32990000, 35990000, '/images/products/macbook-air-m2.jpg', '["images/products/macbook-air-m2-1.jpg", "images/products/macbook-air-m2-2.jpg"]', true, 20, true, true, false, 'macbook-air-m2', NOW(), NOW())
            RETURNING id
        `);
        const macbookAirId = macbookAirResult[0].id;

        // MacBook Pro 14
        const macbookProResult = await queryRunner.query(`
            INSERT INTO products (sku, price, compare_price, thumbnail, gallery, published, quantity, is_featured, is_new, is_sale, slug, created_at, updated_at)
            VALUES ('MBP14', 52990000, 55990000, '/images/products/macbook-pro-14.jpg', '["images/products/macbook-pro-14-1.jpg", "images/products/macbook-pro-14-2.jpg"]', true, 15, true, false, false, 'macbook-pro-14', NOW(), NOW())
            RETURNING id
        `);
        const macbookProId = macbookProResult[0].id;

        // iPad Air 5
        const ipadAirResult = await queryRunner.query(`
            INSERT INTO products (sku, price, compare_price, thumbnail, gallery, published, quantity, is_featured, is_new, is_sale, slug, created_at, updated_at)
            VALUES ('IPADAIR5', 16990000, 18990000, '/images/products/ipad-air-5.jpg', '["images/products/ipad-air-5-1.jpg", "images/products/ipad-air-5-2.jpg"]', true, 25, false, true, true, 'ipad-air-5', NOW(), NOW())
            RETURNING id
        `);
        const ipadAirId = ipadAirResult[0].id;

        // iPad Pro
        const ipadProResult = await queryRunner.query(`
            INSERT INTO products (sku, price, compare_price, thumbnail, gallery, published, quantity, is_featured, is_new, is_sale, slug, created_at, updated_at)
            VALUES ('IPADPRO', 25990000, 27990000, '/images/products/ipad-pro.jpg', '["images/products/ipad-pro-1.jpg", "images/products/ipad-pro-2.jpg"]', true, 10, true, true, false, 'ipad-pro', NOW(), NOW())
            RETURNING id
        `);
        const ipadProId = ipadProResult[0].id;

        // Apple Watch Ultra
        const watchUltraResult = await queryRunner.query(`
            INSERT INTO products (sku, price, compare_price, thumbnail, gallery, published, quantity, is_featured, is_new, is_sale, slug, created_at, updated_at)
            VALUES ('AWUS8', 10990000, 12990000, '/images/products/apple-watch-ultra.jpg', '["images/products/apple-watch-ultra-1.jpg", "images/products/apple-watch-ultra-2.jpg"]', true, 30, true, true, true, 'apple-watch-ultra', NOW(), NOW())
            RETURNING id
        `);
        const watchUltraId = watchUltraResult[0].id;

        // Apple Watch Series 8
        const watchS8Result = await queryRunner.query(`
            INSERT INTO products (sku, price, compare_price, thumbnail, gallery, published, quantity, is_featured, is_new, is_sale, slug, created_at, updated_at)
            VALUES ('AWS8', 8990000, 9990000, '/images/products/apple-watch-series-8.jpg', '["images/products/apple-watch-series-8-1.jpg", "images/products/apple-watch-series-8-2.jpg"]', true, 40, false, true, false, 'apple-watch-series-8', NOW(), NOW())
            RETURNING id
        `);
        const watchS8Id = watchS8Result[0].id;

        // AirPods Case
        const airpodsCaseResult = await queryRunner.query(`
            INSERT INTO products (sku, price, compare_price, thumbnail, gallery, published, quantity, is_featured, is_new, is_sale, slug, created_at, updated_at)
            VALUES ('APCASE', 1290000, 1490000, '/images/products/airpods-case.jpg', '["images/products/airpods-case-1.jpg", "images/products/airpods-case-2.jpg"]', true, 100, false, false, true, 'airpods-case', NOW(), NOW())
            RETURNING id
        `);
        const airpodsCaseId = airpodsCaseResult[0].id;

        // AirPods Pro 2
        const airpodsProResult = await queryRunner.query(`
            INSERT INTO products (sku, price, compare_price, thumbnail, gallery, published, quantity, is_featured, is_new, is_sale, slug, created_at, updated_at)
            VALUES ('APRO2', 5990000, 6990000, '/images/products/airpods-pro-2.jpg', '["images/products/airpods-pro-2-1.jpg", "images/products/airpods-pro-2-2.jpg"]', true, 60, true, false, true, 'airpods-pro-2', NOW(), NOW())
            RETURNING id
        `);
        const airpodsProId = airpodsProResult[0].id;

        // Thêm bản dịch cho sản phẩm (tiếng Việt)
        await queryRunner.query(`
            INSERT INTO product_translations (product_id, locale, title, content, short_description)
            VALUES 
            (${iphone14Id}, 'vi', 'iPhone 14 Pro Max', 'iPhone 14 Pro Max với chip A16 Bionic mạnh mẽ, camera 48MP và màn hình Always-On', 'Flagship mới nhất của Apple với nhiều cải tiến đột phá'),
            (${iphone13Id}, 'vi', 'iPhone 13', 'iPhone 13 với chip A15 Bionic, camera kép 12MP và màn hình Super Retina XDR', 'Hiệu năng mạnh mẽ, camera chụp đêm tuyệt vời'),
            (${macbookAirId}, 'vi', 'MacBook Air M2', 'MacBook Air với chip M2, thiết kế mỏng nhẹ và màn hình Liquid Retina', 'Mỏng nhẹ, mạnh mẽ, thời lượng pin cả ngày'),
            (${macbookProId}, 'vi', 'MacBook Pro 14', 'MacBook Pro 14 inch với chip M1 Pro, màn hình Liquid Retina XDR và nhiều cổng kết nối', 'Dành cho người dùng chuyên nghiệp với hiệu năng vượt trội'),
            (${ipadAirId}, 'vi', 'iPad Air 5', 'iPad Air với chip M1, màn hình Liquid Retina và Touch ID', 'Mỏng nhẹ nhưng mạnh mẽ như máy tính'),
            (${ipadProId}, 'vi', 'iPad Pro', 'iPad Pro với chip M2, màn hình Liquid Retina XDR và Face ID', 'iPad mạnh nhất, thay thế laptop cho công việc chuyên nghiệp'),
            (${watchUltraId}, 'vi', 'Apple Watch Ultra', 'Apple Watch Ultra với thiết kế bền bỉ, pin dài và nhiều tính năng thể thao', 'Đồng hồ thông minh cao cấp nhất của Apple'),
            (${watchS8Id}, 'vi', 'Apple Watch Series 8', 'Apple Watch Series 8 với cảm biến nhiệt độ, phát hiện va chạm và theo dõi sức khỏe', 'Theo dõi sức khỏe toàn diện, kết nối liền mạch'),
            (${airpodsCaseId}, 'vi', 'Vỏ bảo vệ AirPods', 'Vỏ bảo vệ silicone cho AirPods với móc treo và chống sốc', 'Bảo vệ AirPods khỏi trầy xước và va đập'),
            (${airpodsProId}, 'vi', 'AirPods Pro 2', 'AirPods Pro 2 với khả năng chống ồn chủ động, âm thanh không gian và chip H2', 'Trải nghiệm âm thanh đỉnh cao với khả năng chống ồn tốt nhất')
        `);

        // Thêm bản dịch cho sản phẩm (tiếng Anh) - Thêm từng sản phẩm riêng lẻ để tránh lỗi cú pháp
        await queryRunner.query(`
            INSERT INTO product_translations (product_id, locale, title, content, short_description)
            VALUES (${iphone14Id}, 'en', 'iPhone 14 Pro Max', 'iPhone 14 Pro Max with powerful A16 Bionic chip, 48MP camera and Always-On display', 'Apple''s latest flagship with breakthrough improvements')
        `);
        
        await queryRunner.query(`
            INSERT INTO product_translations (product_id, locale, title, content, short_description)
            VALUES (${iphone13Id}, 'en', 'iPhone 13', 'iPhone 13 with A15 Bionic chip, dual 12MP camera system and Super Retina XDR display', 'Powerful performance, excellent night photography')
        `);
        
        await queryRunner.query(`
            INSERT INTO product_translations (product_id, locale, title, content, short_description)
            VALUES (${macbookAirId}, 'en', 'MacBook Air M2', 'MacBook Air with M2 chip, thin design and Liquid Retina display', 'Thin, powerful, all-day battery life')
        `);
        
        await queryRunner.query(`
            INSERT INTO product_translations (product_id, locale, title, content, short_description)
            VALUES (${macbookProId}, 'en', 'MacBook Pro 14', 'MacBook Pro 14-inch with M1 Pro chip, Liquid Retina XDR display and multiple ports', 'For professionals with superior performance')
        `);
        
        await queryRunner.query(`
            INSERT INTO product_translations (product_id, locale, title, content, short_description)
            VALUES (${ipadAirId}, 'en', 'iPad Air 5', 'iPad Air with M1 chip, Liquid Retina display and Touch ID', 'Thin and light but as powerful as a computer')
        `);
        
        await queryRunner.query(`
            INSERT INTO product_translations (product_id, locale, title, content, short_description)
            VALUES (${ipadProId}, 'en', 'iPad Pro', 'iPad Pro with M2 chip, Liquid Retina XDR display and Face ID', 'The most powerful iPad, laptop replacement for professional work')
        `);
        
        await queryRunner.query(`
            INSERT INTO product_translations (product_id, locale, title, content, short_description)
            VALUES (${watchUltraId}, 'en', 'Apple Watch Ultra', 'Apple Watch Ultra with rugged design, long battery life and advanced sports features', 'Apple''s most premium smartwatch')
        `);
        
        await queryRunner.query(`
            INSERT INTO product_translations (product_id, locale, title, content, short_description)
            VALUES (${watchS8Id}, 'en', 'Apple Watch Series 8', 'Apple Watch Series 8 with temperature sensor, crash detection and health tracking', 'Comprehensive health monitoring, seamless connectivity')
        `);
        
        await queryRunner.query(`
            INSERT INTO product_translations (product_id, locale, title, content, short_description)
            VALUES (${airpodsCaseId}, 'en', 'AirPods Case', 'Silicone protective case for AirPods with carabiner and shock protection', 'Protect your AirPods from scratches and impacts')
        `);
        
        await queryRunner.query(`
            INSERT INTO product_translations (product_id, locale, title, content, short_description)
            VALUES (${airpodsProId}, 'en', 'AirPods Pro 2', 'AirPods Pro 2 with active noise cancellation, spatial audio and H2 chip', 'Premium audio experience with best-in-class noise cancellation')
        `);

        // Lấy ID của các danh mục
        const categoriesResult = await queryRunner.query(`
            SELECT id, slug FROM categories 
            WHERE slug IN ('dien-thoai', 'laptop', 'may-tinh-bang', 'phu-kien', 'dong-ho-thong-minh')
        `);
        
        // Tạo map từ slug đến id
        const categoryMap = {};
        categoriesResult.forEach(cat => {
            categoryMap[cat.slug] = cat.id;
        });

        // Liên kết sản phẩm với danh mục
        await queryRunner.query(`
            INSERT INTO product_categories (product_id, category_id)
            VALUES 
            (${iphone14Id}, ${categoryMap['dien-thoai']}), -- iPhone 14 Pro Max -> Điện thoại
            (${iphone13Id}, ${categoryMap['dien-thoai']}), -- iPhone 13 -> Điện thoại
            (${macbookAirId}, ${categoryMap['laptop']}), -- MacBook Air M2 -> Laptop
            (${macbookProId}, ${categoryMap['laptop']}), -- MacBook Pro 14 -> Laptop
            (${ipadAirId}, ${categoryMap['may-tinh-bang']}), -- iPad Air 5 -> Máy tính bảng
            (${ipadProId}, ${categoryMap['may-tinh-bang']}), -- iPad Pro -> Máy tính bảng
            (${watchUltraId}, ${categoryMap['dong-ho-thong-minh']}), -- Apple Watch Ultra -> Đồng hồ thông minh
            (${watchS8Id}, ${categoryMap['dong-ho-thong-minh']}), -- Apple Watch Series 8 -> Đồng hồ thông minh
            (${airpodsCaseId}, ${categoryMap['phu-kien']}), -- Vỏ bảo vệ AirPods -> Phụ kiện
            (${airpodsProId}, ${categoryMap['phu-kien']}) -- AirPods Pro 2 -> Phụ kiện
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa liên kết sản phẩm với danh mục
        await queryRunner.query(`DELETE FROM product_categories WHERE product_id IN (SELECT id FROM products WHERE slug IN ('iphone-14-pro-max', 'iphone-13', 'macbook-air-m2', 'macbook-pro-14', 'ipad-air-5', 'ipad-pro', 'apple-watch-ultra', 'apple-watch-series-8', 'airpods-case', 'airpods-pro-2'))`);
        
        // Xóa bản dịch sản phẩm
        await queryRunner.query(`DELETE FROM product_translations WHERE product_id IN (SELECT id FROM products WHERE slug IN ('iphone-14-pro-max', 'iphone-13', 'macbook-air-m2', 'macbook-pro-14', 'ipad-air-5', 'ipad-pro', 'apple-watch-ultra', 'apple-watch-series-8', 'airpods-case', 'airpods-pro-2'))`);
        
        // Xóa sản phẩm
        await queryRunner.query(`DELETE FROM products WHERE slug IN ('iphone-14-pro-max', 'iphone-13', 'macbook-air-m2', 'macbook-pro-14', 'ipad-air-5', 'ipad-pro', 'apple-watch-ultra', 'apple-watch-series-8', 'airpods-case', 'airpods-pro-2')`);
        
        // Xóa danh mục
        await queryRunner.query(`DELETE FROM categories WHERE slug IN ('dien-thoai', 'laptop', 'may-tinh-bang', 'phu-kien', 'dong-ho-thong-minh')`);
    }
} 