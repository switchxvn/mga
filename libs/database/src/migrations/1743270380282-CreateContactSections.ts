import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateContactSections1743270380282 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create contact_sections table
        await queryRunner.query(`
            CREATE TABLE "contact_sections" (
                "id" SERIAL NOT NULL,
                "type" VARCHAR NOT NULL,
                "component_name" VARCHAR(100) NOT NULL,
                "order" integer NOT NULL DEFAULT '0',
                "settings" jsonb NOT NULL DEFAULT '{}',
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_contact_sections" PRIMARY KEY ("id")
            )
        `);

        // Create contact_section_translations table
        await queryRunner.query(`
            CREATE TABLE "contact_section_translations" (
                "id" SERIAL NOT NULL,
                "section_id" integer NOT NULL,
                "locale" VARCHAR(2) NOT NULL,
                "title" VARCHAR NOT NULL,
                "subtitle" TEXT,
                "content" TEXT,
                "data" jsonb,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_contact_section_translations" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "contact_section_translations" 
            ADD CONSTRAINT "FK_contact_section_translations_section_id" 
            FOREIGN KEY ("section_id") 
            REFERENCES "contact_sections"("id") 
            ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "contact_section_translations" 
            DROP CONSTRAINT "FK_contact_section_translations_section_id"
        `);

        // Drop tables
        await queryRunner.query(`DROP TABLE "contact_section_translations"`);
        await queryRunner.query(`DROP TABLE "contact_sections"`);
    }
} 