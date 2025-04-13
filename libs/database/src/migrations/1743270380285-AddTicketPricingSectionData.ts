import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTicketPricingSectionData1743270380285 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert hero section
        await queryRunner.query(`
            INSERT INTO "ticket_pricing_sections" (
                "type", 
                "component_name", 
                "order", 
                "settings", 
                "is_active", 
                "created_at", 
                "updated_at"
            ) VALUES (
                'hero', 
                'TicketPricingHeroSection', 
                0, 
                '{"backgroundColor": "bg-gray-100 dark:bg-gray-900", "width": "container mx-auto", "margin": "py-16", "typography": {"heading": "text-4xl font-bold", "subheading": "text-xl"}, "colors": {"heading": "text-gray-900 dark:text-gray-100", "subheading": "text-gray-600 dark:text-gray-400"}}', 
                true, 
                NOW(), 
                NOW()
            ) RETURNING "id"
        `);

        // Lấy ID của hero section
        const heroSectionResult = await queryRunner.query(`
            SELECT "id" FROM "ticket_pricing_sections" WHERE "component_name" = 'TicketPricingHeroSection'
        `);
        const heroSectionId = heroSectionResult[0].id;

        // Insert hero section translations
        await queryRunner.query(`
            INSERT INTO "ticket_pricing_section_translations" (
                "locale", 
                "title", 
                "subtitle", 
                "content", 
                "section_id", 
                "created_at", 
                "updated_at"
            ) VALUES 
            ('vi', 'Bảng Giá Vé Tham Quan', 'Lựa chọn vé phù hợp với nhu cầu của bạn', NULL, ${heroSectionId}, NOW(), NOW()),
            ('en', 'Ticket Pricing', 'Choose the ticket that best suits your needs', NULL, ${heroSectionId}, NOW(), NOW())
        `);

        // Insert pricing table section
        await queryRunner.query(`
            INSERT INTO "ticket_pricing_sections" (
                "type", 
                "component_name", 
                "order", 
                "settings", 
                "is_active", 
                "created_at", 
                "updated_at"
            ) VALUES (
                'pricing_table', 
                'TicketPricingTableSection', 
                1, 
                '{"backgroundColor": "bg-white dark:bg-gray-800", "width": "container mx-auto", "margin": "py-16", "typography": {"heading": "text-3xl font-bold", "subheading": "text-lg"}, "colors": {"heading": "text-gray-900 dark:text-gray-100", "subheading": "text-gray-600 dark:text-gray-400"}, "table": {"headerBackgroundColor": "bg-primary-500", "headerTextColor": "text-white", "rowBackgroundColor": "bg-gray-50 dark:bg-gray-700", "rowTextColor": "text-gray-900 dark:text-gray-100", "alternateRowBackgroundColor": "bg-white dark:bg-gray-800"}}', 
                true, 
                NOW(), 
                NOW()
            ) RETURNING "id"
        `);

        // Lấy ID của pricing table section
        const pricingTableSectionResult = await queryRunner.query(`
            SELECT "id" FROM "ticket_pricing_sections" WHERE "component_name" = 'TicketPricingTableSection'
        `);
        const pricingTableSectionId = pricingTableSectionResult[0].id;

        // Insert pricing table section translations
        await queryRunner.query(`
            INSERT INTO "ticket_pricing_section_translations" (
                "locale", 
                "title", 
                "subtitle", 
                "content", 
                "section_id", 
                "created_at", 
                "updated_at"
            ) VALUES 
            ('vi', 'Bảng Giá Vé', 'Tham khảo bảng giá vé dưới đây', NULL, ${pricingTableSectionId}, NOW(), NOW()),
            ('en', 'Ticket Prices', 'Check out our ticket prices below', NULL, ${pricingTableSectionId}, NOW(), NOW())
        `);

        // Insert benefits section
        await queryRunner.query(`
            INSERT INTO "ticket_pricing_sections" (
                "type", 
                "component_name", 
                "order", 
                "settings", 
                "is_active", 
                "created_at", 
                "updated_at"
            ) VALUES (
                'benefits', 
                'TicketPricingBenefitsSection', 
                2, 
                '{"backgroundColor": "bg-gray-50 dark:bg-gray-900", "width": "container mx-auto", "margin": "py-16", "typography": {"heading": "text-3xl font-bold", "subheading": "text-lg"}, "colors": {"heading": "text-gray-900 dark:text-gray-100", "subheading": "text-gray-600 dark:text-gray-400"}, "benefits": [{"icon": "check-circle", "title": "Miễn phí vé cho trẻ em dưới 1m", "description": "Trẻ em dưới 1m được miễn phí vé tham quan"}, {"icon": "check-circle", "title": "Giảm giá cho nhóm", "description": "Đặt vé theo nhóm từ 10 người trở lên được giảm 10%"}, {"icon": "check-circle", "title": "Hỗ trợ đưa đón", "description": "Miễn phí xe đưa đón cho các tour từ 20 người trở lên"}]}', 
                true, 
                NOW(), 
                NOW()
            ) RETURNING "id"
        `);

        // Lấy ID của benefits section
        const benefitsSectionResult = await queryRunner.query(`
            SELECT "id" FROM "ticket_pricing_sections" WHERE "component_name" = 'TicketPricingBenefitsSection'
        `);
        const benefitsSectionId = benefitsSectionResult[0].id;

        // Insert benefits section translations
        await queryRunner.query(`
            INSERT INTO "ticket_pricing_section_translations" (
                "locale", 
                "title", 
                "subtitle", 
                "content", 
                "section_id", 
                "created_at", 
                "updated_at"
            ) VALUES 
            ('vi', 'Lợi Ích Khi Đặt Vé', 'Những ưu đãi đặc biệt dành cho bạn', NULL, ${benefitsSectionId}, NOW(), NOW()),
            ('en', 'Benefits of Booking Tickets', 'Special offers just for you', NULL, ${benefitsSectionId}, NOW(), NOW())
        `);

        // Insert FAQ section
        await queryRunner.query(`
            INSERT INTO "ticket_pricing_sections" (
                "type", 
                "component_name", 
                "order", 
                "settings", 
                "is_active", 
                "created_at", 
                "updated_at"
            ) VALUES (
                'faq', 
                'TicketPricingFaqSection', 
                3, 
                '{"backgroundColor": "bg-white dark:bg-gray-800", "width": "container mx-auto", "margin": "py-16", "typography": {"heading": "text-3xl font-bold", "subheading": "text-lg"}, "colors": {"heading": "text-gray-900 dark:text-gray-100", "subheading": "text-gray-600 dark:text-gray-400"}, "faqs": [{"question": "Làm thế nào để đặt vé?", "answer": "Bạn có thể đặt vé trực tuyến thông qua website của chúng tôi hoặc liên hệ với chúng tôi qua số điện thoại."}, {"question": "Có thể hủy vé không?", "answer": "Bạn có thể hủy vé trước 24 giờ và được hoàn 80% giá vé."}, {"question": "Có giảm giá cho nhóm không?", "answer": "Có, chúng tôi cung cấp giảm giá 10% cho nhóm từ 10 người trở lên."}]}', 
                true, 
                NOW(), 
                NOW()
            ) RETURNING "id"
        `);

        // Lấy ID của FAQ section
        const faqSectionResult = await queryRunner.query(`
            SELECT "id" FROM "ticket_pricing_sections" WHERE "component_name" = 'TicketPricingFaqSection'
        `);
        const faqSectionId = faqSectionResult[0].id;

        // Insert FAQ section translations
        await queryRunner.query(`
            INSERT INTO "ticket_pricing_section_translations" (
                "locale", 
                "title", 
                "subtitle", 
                "content", 
                "section_id", 
                "created_at", 
                "updated_at"
            ) VALUES 
            ('vi', 'Câu Hỏi Thường Gặp', 'Giải đáp thắc mắc về vé tham quan', NULL, ${faqSectionId}, NOW(), NOW()),
            ('en', 'Frequently Asked Questions', 'Answers to common questions about tickets', NULL, ${faqSectionId}, NOW(), NOW())
        `);

        // Insert CTA section
        await queryRunner.query(`
            INSERT INTO "ticket_pricing_sections" (
                "type", 
                "component_name", 
                "order", 
                "settings", 
                "is_active", 
                "created_at", 
                "updated_at"
            ) VALUES (
                'cta', 
                'TicketPricingCtaSection', 
                4, 
                '{"backgroundColor": "bg-primary-500", "width": "container mx-auto", "margin": "py-16", "typography": {"heading": "text-3xl font-bold", "subheading": "text-lg"}, "colors": {"heading": "text-white", "subheading": "text-white/80"}, "button": {"text": "Đặt Vé Ngay", "url": "/tickets", "backgroundColor": "bg-white", "textColor": "text-primary-500"}}', 
                true, 
                NOW(), 
                NOW()
            ) RETURNING "id"
        `);

        // Lấy ID của CTA section
        const ctaSectionResult = await queryRunner.query(`
            SELECT "id" FROM "ticket_pricing_sections" WHERE "component_name" = 'TicketPricingCtaSection'
        `);
        const ctaSectionId = ctaSectionResult[0].id;

        // Insert CTA section translations
        await queryRunner.query(`
            INSERT INTO "ticket_pricing_section_translations" (
                "locale", 
                "title", 
                "subtitle", 
                "content", 
                "section_id", 
                "created_at", 
                "updated_at"
            ) VALUES 
            ('vi', 'Sẵn Sàng Đặt Vé?', 'Đặt vé ngay hôm nay để nhận ưu đãi đặc biệt', NULL, ${ctaSectionId}, NOW(), NOW()),
            ('en', 'Ready to Book?', 'Book your tickets today for special offers', NULL, ${ctaSectionId}, NOW(), NOW())
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa tất cả dữ liệu đã thêm
        await queryRunner.query(`
            DELETE FROM "ticket_pricing_section_translations" 
            WHERE "section_id" IN (
                SELECT "id" FROM "ticket_pricing_sections" 
                WHERE "component_name" IN (
                    'TicketPricingHeroSection', 
                    'TicketPricingTableSection', 
                    'TicketPricingBenefitsSection', 
                    'TicketPricingFaqSection', 
                    'TicketPricingCtaSection'
                )
            )
        `);

        await queryRunner.query(`
            DELETE FROM "ticket_pricing_sections" 
            WHERE "component_name" IN (
                'TicketPricingHeroSection', 
                'TicketPricingTableSection', 
                'TicketPricingBenefitsSection', 
                'TicketPricingFaqSection', 
                'TicketPricingCtaSection'
            )
        `);
    }
} 