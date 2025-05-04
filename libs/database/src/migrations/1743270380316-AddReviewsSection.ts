import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReviewsSection1743270380316 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Get default theme id
        const themeResult = await queryRunner.query(`
            SELECT id FROM themes WHERE is_active = true LIMIT 1
        `);
        const themeId = themeResult[0]?.id || 1;

        // Insert reviews section configuration
        await queryRunner.query(`
            INSERT INTO theme_sections 
            (theme_id, type, component_name, title, "order", settings, page_type, is_active)
            VALUES 
            (
                ${themeId},
                'reviews',
                'ReviewsSection',
                'Customer Reviews', 
                100, 
                '{
                    "limit": 6,
                    "sectionTitle": {
                        "en": "What Our Customers Say",
                        "vi": "Khách hàng nói gì về chúng tôi"
                    },
                    "sectionDescription": {
                        "en": "Read testimonials from our satisfied customers about their experiences with our services and products.",
                        "vi": "Đọc nhận xét từ khách hàng hài lòng về trải nghiệm dịch vụ và sản phẩm của chúng tôi."
                    },
                    "backgroundColor": "bg-gray-50 dark:bg-gray-900",
                    "textColor": "text-gray-900 dark:text-white",
                    "buttonText": {
                        "en": "View All Reviews",
                        "vi": "Xem tất cả đánh giá"
                    },
                    "buttonColor": "bg-primary-600 hover:bg-primary-700 text-white"
                }'::jsonb,
                'home_page',
                true
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Delete reviews section 
        await queryRunner.query(`
            DELETE FROM theme_sections
            WHERE type = 'reviews'
        `);
    }
} 