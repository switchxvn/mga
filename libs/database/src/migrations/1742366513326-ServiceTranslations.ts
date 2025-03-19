import { MigrationInterface, QueryRunner } from "typeorm";

export class ServiceTranslations1742366513326 implements MigrationInterface {
    name = 'ServiceTranslations1742366513326'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create service_translations table
        await queryRunner.query(`CREATE TABLE "service_translations" (
            "id" SERIAL NOT NULL, 
            "title" character varying NOT NULL,
            "description" text,
            "short_description" text,
            "locale" character varying(2) NOT NULL,
            "meta_title" character varying,
            "meta_description" text,
            "meta_keywords" character varying,
            "og_title" character varying,
            "og_description" text,
            "og_image" character varying,
            "canonical_url" character varying,
            "service_id" integer NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_service_translations" PRIMARY KEY ("id")
        )`);

        // Add foreign key
        await queryRunner.query(`ALTER TABLE "service_translations" ADD CONSTRAINT "FK_service_translations_service" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);

        // Copy existing title and description to translations with default locale 'en'
        await queryRunner.query(`
            INSERT INTO "service_translations" (title, description, locale, service_id, created_at, updated_at)
            SELECT title, description, 'en', id, created_at, updated_at
            FROM "services"
        `);

        // Drop title and description columns from services table
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "description"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add back title and description columns
        await queryRunner.query(`ALTER TABLE "services" ADD "title" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ADD "description" text NOT NULL`);

        // Copy data back from translations
        await queryRunner.query(`
            UPDATE "services" s
            SET title = st.title,
                description = st.description
            FROM "service_translations" st
            WHERE s.id = st.service_id AND st.locale = 'en'
        `);

        // Drop foreign key and translations table
        await queryRunner.query(`ALTER TABLE "service_translations" DROP CONSTRAINT "FK_service_translations_service"`);
        await queryRunner.query(`DROP TABLE "service_translations"`);
    }
} 