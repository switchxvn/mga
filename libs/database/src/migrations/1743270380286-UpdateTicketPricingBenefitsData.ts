import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTicketPricingBenefitsData1743270380286 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update benefits section settings
        await queryRunner.query(`
            UPDATE "ticket_pricing_sections"
            SET "settings" = '{
                "backgroundColor": "bg-gray-50 dark:bg-gray-900",
                "width": "container mx-auto",
                "margin": "py-16",
                "typography": {
                    "heading": "text-3xl md:text-4xl font-bold text-center",
                    "subheading": "text-xl text-center",
                    "benefitTitle": "text-xl font-semibold",
                    "benefitDescription": "text-base"
                },
                "colors": {
                    "heading": "text-gray-900 dark:text-gray-100",
                    "subheading": "text-gray-600 dark:text-gray-400",
                    "benefitTitle": "text-gray-900 dark:text-gray-100",
                    "benefitDescription": "text-gray-600 dark:text-gray-400",
                    "icon": "text-primary-500 dark:text-primary-400"
                },
                "benefits": [
                    {
                        "id": 1,
                        "icon": "Baby",
                        "title": "Miễn phí vé cho trẻ dưới 1.2m và người già",
                        "description": "Trẻ em dưới 1.2m và người cao tuổi trên 70 tuổi được miễn phí vé tham quan"
                    },
                    {
                        "id": 2,
                        "icon": "Bus",
                        "title": "Miễn phí xe điện đưa đón",
                        "description": "Dịch vụ xe điện miễn phí đưa đón quý khách từ nhà ga đến khu vực cáp treo"
                    },
                    {
                        "id": 3,
                        "icon": "Users",
                        "title": "Ưu đãi cho nhóm",
                        "description": "Giảm giá đặc biệt cho đoàn khách từ 10 người trở lên"
                    }
                ]
            }'::jsonb
            WHERE "type" = 'benefits' AND "component_name" = 'TicketPricingBenefitsSection';
        `);

        // Update benefits section translations
        await queryRunner.query(`
            UPDATE "ticket_pricing_section_translations"
            SET 
                "title" = CASE 
                    WHEN "locale" = 'vi' THEN 'Ưu Đãi Đặc Biệt'
                    WHEN "locale" = 'en' THEN 'Special Benefits'
                    ELSE "title"
                END,
                "subtitle" = CASE 
                    WHEN "locale" = 'vi' THEN 'Những ưu đãi hấp dẫn dành cho quý khách'
                    WHEN "locale" = 'en' THEN 'Exclusive benefits for our valued guests'
                    ELSE "subtitle"
                END
            WHERE "section_id" = (
                SELECT "id" FROM "ticket_pricing_sections" 
                WHERE "type" = 'benefits' AND "component_name" = 'TicketPricingBenefitsSection'
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Restore original benefits section settings
        await queryRunner.query(`
            UPDATE "ticket_pricing_sections"
            SET "settings" = '{
                "backgroundColor": "bg-gray-50 dark:bg-gray-900",
                "width": "container mx-auto",
                "margin": "py-16",
                "typography": {
                    "heading": "text-3xl font-bold",
                    "subheading": "text-lg"
                },
                "colors": {
                    "heading": "text-gray-900 dark:text-gray-100",
                    "subheading": "text-gray-600 dark:text-gray-400"
                },
                "benefits": [
                    {
                        "id": 1,
                        "icon": "check-circle",
                        "title": "Miễn phí vé cho trẻ em dưới 1m",
                        "description": "Trẻ em dưới 1m được miễn phí vé tham quan"
                    },
                    {
                        "id": 2,
                        "icon": "check-circle",
                        "title": "Giảm giá cho nhóm",
                        "description": "Đặt vé theo nhóm từ 10 người trở lên được giảm 10%"
                    },
                    {
                        "id": 3,
                        "icon": "check-circle",
                        "title": "Hỗ trợ đưa đón",
                        "description": "Miễn phí xe đưa đón cho các tour từ 20 người trở lên"
                    }
                ]
            }'::jsonb
            WHERE "type" = 'benefits' AND "component_name" = 'TicketPricingBenefitsSection';
        `);

        // Restore original translations
        await queryRunner.query(`
            UPDATE "ticket_pricing_section_translations"
            SET 
                "title" = CASE 
                    WHEN "locale" = 'vi' THEN 'Lợi Ích Khi Đặt Vé'
                    WHEN "locale" = 'en' THEN 'Benefits of Booking Tickets'
                    ELSE "title"
                END,
                "subtitle" = CASE 
                    WHEN "locale" = 'vi' THEN 'Những ưu đãi đặc biệt dành cho bạn'
                    WHEN "locale" = 'en' THEN 'Special offers just for you'
                    ELSE "subtitle"
                END
            WHERE "section_id" = (
                SELECT "id" FROM "ticket_pricing_sections" 
                WHERE "type" = 'benefits' AND "component_name" = 'TicketPricingBenefitsSection'
            );
        `);
    }
} 