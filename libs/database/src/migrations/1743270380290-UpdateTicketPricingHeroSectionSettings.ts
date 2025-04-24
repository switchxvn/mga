import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTicketPricingHeroSectionSettings1743270380290 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Cập nhật settings cho hero section
        await queryRunner.query(`
            UPDATE "ticket_pricing_sections"
            SET "settings" = '{
                "width": "container mx-auto", 
                "colors": {
                    "heading": "text-primary-600 dark:text-primary-400", 
                    "primary": "text-primary-600 dark:text-primary-400", 
                    "subheading": "text-gray-600 dark:text-gray-400"
                }, 
                "margin": "py-16", 
                "typography": {
                    "heading": "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-center tracking-tight", 
                    "subheading": "text-lg sm:text-xl md:text-2xl text-center max-w-2xl mx-auto font-medium"
                }, 
                "backgroundColor": "bg-gray-100 dark:bg-gray-900",
                "image": {
                    "src": "/images/ticket-pricing-hero.jpg",
                    "alt": "Ticket Pricing Hero Image",
                    "width": 1200,
                    "height": 600,
                    "position": "center",
                    "objectFit": "cover",
                    "overlay": {
                        "enabled": true,
                        "color": "rgba(0, 0, 0, 0.5)",
                        "blendMode": "multiply"
                    }
                }
            }'
            WHERE "type" = 'hero' AND "component_name" = 'TicketPricingHeroSection'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Khôi phục settings ban đầu cho hero section
        await queryRunner.query(`
            UPDATE "ticket_pricing_sections"
            SET "settings" = '{
                "backgroundColor": "bg-gray-100 dark:bg-gray-900", 
                "width": "container mx-auto", 
                "margin": "py-16", 
                "typography": {
                    "heading": "text-4xl font-bold", 
                    "subheading": "text-xl"
                }, 
                "colors": {
                    "heading": "text-gray-900 dark:text-gray-100", 
                    "subheading": "text-gray-600 dark:text-gray-400"
                }
            }'
            WHERE "type" = 'hero' AND "component_name" = 'TicketPricingHeroSection'
        `);
    }
} 