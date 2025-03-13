import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLanguagesTable1738828575716 implements MigrationInterface {
    name = 'CreateLanguagesTable1738828575716'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create languages table
        await queryRunner.query(`CREATE TABLE "languages" (
            "id" SERIAL NOT NULL, 
            "code" character varying NOT NULL, 
            "name" character varying NOT NULL, 
            "native_name" character varying NOT NULL, 
            "flag_code" character varying NOT NULL, 
            "is_active" boolean NOT NULL DEFAULT true, 
            "is_default" boolean NOT NULL DEFAULT false, 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "UQ_languages_code" UNIQUE ("code"), 
            CONSTRAINT "PK_languages" PRIMARY KEY ("id")
        )`);

        // Insert default languages: English and Vietnamese
        await queryRunner.query(`INSERT INTO "languages" 
            ("code", "name", "native_name", "flag_code", "is_active", "is_default") VALUES 
            ('en', 'English', 'English', 'us', true, true),
            ('vi', 'Vietnamese', 'Tiếng Việt', 'vn', true, false)
        `);

        // Create translations table for storing translations
        await queryRunner.query(`CREATE TABLE "translations" (
            "id" SERIAL NOT NULL, 
            "language_code" character varying NOT NULL, 
            "key" character varying NOT NULL, 
            "value" text NOT NULL, 
            "namespace" character varying DEFAULT 'common', 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "UQ_translations_language_key_namespace" UNIQUE ("language_code", "key", "namespace"), 
            CONSTRAINT "PK_translations" PRIMARY KEY ("id")
        )`);

        // Add foreign key constraint
        await queryRunner.query(`ALTER TABLE "translations" ADD CONSTRAINT "FK_translations_languages" 
            FOREIGN KEY ("language_code") REFERENCES "languages"("code") ON DELETE CASCADE ON UPDATE CASCADE`);

        // Insert some basic translations
        await queryRunner.query(`INSERT INTO "translations" 
            ("language_code", "key", "value", "namespace") VALUES 
            ('en', 'language', 'Language', 'common'),
            ('vi', 'language', 'Ngôn ngữ', 'common'),
            ('en', 'welcome', 'Welcome', 'common'),
            ('vi', 'welcome', 'Chào mừng', 'common')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "translations" DROP CONSTRAINT "FK_translations_languages"`);
        await queryRunner.query(`DROP TABLE "translations"`);
        await queryRunner.query(`DROP TABLE "languages"`);
    }
} 