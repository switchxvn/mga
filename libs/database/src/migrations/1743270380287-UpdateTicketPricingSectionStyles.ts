import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTicketPricingSectionStyles1743270380287 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Chuẩn hóa style cho tất cả các section
        const standardizedTypography = {
            heading: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-center tracking-tight",
            subheading: "text-lg sm:text-xl md:text-2xl text-center max-w-2xl mx-auto font-medium"
        };

        const standardizedColors = {
            heading: "text-primary-600 dark:text-primary-400",
            subheading: "text-gray-600 dark:text-gray-400",
            primary: "text-primary-600 dark:text-primary-400"
        };

        // Update hero section
        await queryRunner.query(`
            UPDATE "ticket_pricing_sections"
            SET "settings" = jsonb_set(
                jsonb_set(
                    "settings",
                    '{typography}',
                    '${JSON.stringify(standardizedTypography)}'::jsonb
                ),
                '{colors}',
                '${JSON.stringify(standardizedColors)}'::jsonb
            )
            WHERE "type" = 'hero' AND "component_name" = 'TicketPricingHeroSection';
        `);

        // Update benefits section
        await queryRunner.query(`
            UPDATE "ticket_pricing_sections"
            SET "settings" = jsonb_set(
                jsonb_set(
                    "settings",
                    '{typography}',
                    '${JSON.stringify(standardizedTypography)}'::jsonb
                ),
                '{colors}',
                '${JSON.stringify(standardizedColors)}'::jsonb
            )
            WHERE "type" = 'benefits' AND "component_name" = 'TicketPricingBenefitsSection';
        `);

        // Update FAQ section
        await queryRunner.query(`
            UPDATE "ticket_pricing_sections"
            SET "settings" = jsonb_set(
                jsonb_set(
                    "settings",
                    '{typography}',
                    '${JSON.stringify(standardizedTypography)}'::jsonb
                ),
                '{colors}',
                '${JSON.stringify(standardizedColors)}'::jsonb
            )
            WHERE "type" = 'faq' AND "component_name" = 'TicketPricingFaqSection';
        `);

        // Thêm padding và layout cho FAQ section
        await queryRunner.query(`
            UPDATE "ticket_pricing_sections"
            SET "settings" = jsonb_set(
                "settings",
                '{padding,cardBackgroundColor,contentBackgroundColor,faqLayout}',
                '{"padding": "4rem 0", "cardBackgroundColor": "bg-white dark:bg-gray-800", "contentBackgroundColor": "bg-white dark:bg-gray-800", "faqLayout": "accordion"}'::jsonb
            )
            WHERE "type" = 'faq' AND "component_name" = 'TicketPricingFaqSection';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Khôi phục lại style ban đầu cho hero section
        await queryRunner.query(`
            UPDATE "ticket_pricing_sections"
            SET "settings" = jsonb_set(
                jsonb_set(
                    "settings",
                    '{typography}',
                    '{"heading": "text-4xl font-bold", "subheading": "text-xl"}'::jsonb
                ),
                '{colors}',
                '{"heading": "text-gray-900 dark:text-gray-100", "subheading": "text-gray-600 dark:text-gray-400"}'::jsonb
            )
            WHERE "type" = 'hero' AND "component_name" = 'TicketPricingHeroSection';
        `);

        // Khôi phục lại style ban đầu cho benefits section
        await queryRunner.query(`
            UPDATE "ticket_pricing_sections"
            SET "settings" = jsonb_set(
                jsonb_set(
                    "settings",
                    '{typography}',
                    '{"heading": "text-3xl font-bold", "subheading": "text-lg"}'::jsonb
                ),
                '{colors}',
                '{"heading": "text-gray-900 dark:text-gray-100", "subheading": "text-gray-600 dark:text-gray-400"}'::jsonb
            )
            WHERE "type" = 'benefits' AND "component_name" = 'TicketPricingBenefitsSection';
        `);

        // Khôi phục lại style ban đầu cho FAQ section
        await queryRunner.query(`
            UPDATE "ticket_pricing_sections"
            SET "settings" = jsonb_set(
                jsonb_set(
                    "settings",
                    '{typography}',
                    '{"heading": "text-3xl font-bold", "subheading": "text-lg"}'::jsonb
                ),
                '{colors}',
                '{"heading": "text-gray-900 dark:text-gray-100", "subheading": "text-gray-600 dark:text-gray-400"}'::jsonb
            )
            WHERE "type" = 'faq' AND "component_name" = 'TicketPricingFaqSection';
        `);

        // Xóa các thuộc tính padding và layout cho FAQ section
        await queryRunner.query(`
            UPDATE "ticket_pricing_sections"
            SET "settings" = "settings" - 'padding' - 'cardBackgroundColor' - 'contentBackgroundColor' - 'faqLayout'
            WHERE "type" = 'faq' AND "component_name" = 'TicketPricingFaqSection';
        `);
    }
} 