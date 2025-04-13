import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTicketPricingSection1743270380284 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tạo enum cho loại section
        await queryRunner.query(`
            CREATE TYPE "public"."ticket_pricing_section_type_enum" AS ENUM(
                'hero', 
                'pricing_table', 
                'benefits', 
                'faq', 
                'cta'
            )
        `);

        // Tạo bảng ticket_pricing_sections
        await queryRunner.query(`
            CREATE TABLE "ticket_pricing_sections" (
                "id" SERIAL NOT NULL,
                "type" "public"."ticket_pricing_section_type_enum" NOT NULL DEFAULT 'pricing_table',
                "component_name" character varying(100) NOT NULL,
                "order" integer NOT NULL DEFAULT '0',
                "settings" jsonb NOT NULL DEFAULT '{}',
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_ticket_pricing_sections" PRIMARY KEY ("id")
            )
        `);

        // Tạo bảng ticket_pricing_section_translations
        await queryRunner.query(`
            CREATE TABLE "ticket_pricing_section_translations" (
                "id" SERIAL NOT NULL,
                "locale" character varying(10) NOT NULL,
                "title" character varying(255) NOT NULL,
                "subtitle" character varying(255),
                "content" text,
                "data" jsonb,
                "section_id" integer NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_ticket_pricing_section_translations" PRIMARY KEY ("id")
            )
        `);

        // Tạo foreign key
        await queryRunner.query(`
            ALTER TABLE "ticket_pricing_section_translations" 
            ADD CONSTRAINT "FK_ticket_pricing_section_translations_section" 
            FOREIGN KEY ("section_id") 
            REFERENCES "ticket_pricing_sections"("id") 
            ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa foreign key
        await queryRunner.query(`
            ALTER TABLE "ticket_pricing_section_translations" 
            DROP CONSTRAINT "FK_ticket_pricing_section_translations_section"
        `);

        // Xóa bảng ticket_pricing_section_translations
        await queryRunner.query(`
            DROP TABLE "ticket_pricing_section_translations"
        `);

        // Xóa bảng ticket_pricing_sections
        await queryRunner.query(`
            DROP TABLE "ticket_pricing_sections"
        `);

        // Xóa enum
        await queryRunner.query(`
            DROP TYPE "public"."ticket_pricing_section_type_enum"
        `);
    }
} 