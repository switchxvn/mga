import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAboutSections1743270380276 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum type for section types
        await queryRunner.query(`
            CREATE TYPE "about_section_type_enum" AS ENUM (
                'hero',
                'content',
                'team',
                'milestone',
                'stats',
                'gallery'
            )
        `);

        // Create about_sections table
        await queryRunner.query(`
            CREATE TABLE "about_sections" (
                "id" SERIAL NOT NULL,
                "type" "about_section_type_enum" NOT NULL DEFAULT 'content',
                "component_name" character varying(100) NOT NULL,
                "order" integer NOT NULL DEFAULT 0,
                "settings" jsonb NOT NULL DEFAULT '{}',
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_about_sections" PRIMARY KEY ("id")
            )
        `);

        // Create about_section_translations table
        await queryRunner.query(`
            CREATE TABLE "about_section_translations" (
                "id" SERIAL NOT NULL,
                "section_id" integer NOT NULL,
                "locale" character varying(2) NOT NULL,
                "title" character varying NOT NULL,
                "subtitle" text,
                "content" text,
                "data" jsonb,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_about_section_translations" PRIMARY KEY ("id"),
                CONSTRAINT "FK_about_section_translations_section" FOREIGN KEY ("section_id") 
                    REFERENCES "about_sections"("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);

        // Create index for locale
        await queryRunner.query(`
            CREATE INDEX "IDX_about_section_translations_locale" ON "about_section_translations" ("locale")
        `);

        // Create unique constraint for section_id and locale
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_about_section_translations_unique" 
            ON "about_section_translations" ("section_id", "locale")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_about_section_translations_unique"`);
        await queryRunner.query(`DROP INDEX "IDX_about_section_translations_locale"`);
        await queryRunner.query(`DROP TABLE "about_section_translations"`);
        await queryRunner.query(`DROP TABLE "about_sections"`);
        await queryRunner.query(`DROP TYPE "about_section_type_enum"`);
    }
} 