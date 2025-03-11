import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSlugToPostTranslations1741667026894 implements MigrationInterface {
    name = 'AddSlugToPostTranslations1741667026894'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add slug column to post_translations table
        await queryRunner.query(`ALTER TABLE "post_translations" ADD "slug" character varying`);
        
        // Create unique index on slug and locale combination
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_post_translations_slug_locale" ON "post_translations" ("slug", "locale") WHERE "slug" IS NOT NULL`);
        
        // Update existing translations to have slugs based on their titles
        await queryRunner.query(`
            UPDATE "post_translations"
            SET "slug" = LOWER(REGEXP_REPLACE(
                REGEXP_REPLACE(
                    REGEXP_REPLACE(title, '[^\\w\\s-]', '', 'g'),
                    '\\s+', '-', 'g'
                ),
                '-+', '-', 'g'
            ))
        `);
        
        // Make slug column required after populating existing data
        await queryRunner.query(`ALTER TABLE "post_translations" ALTER COLUMN "slug" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the unique index first
        await queryRunner.query(`DROP INDEX "IDX_post_translations_slug_locale"`);
        
        // Drop the slug column
        await queryRunner.query(`ALTER TABLE "post_translations" DROP COLUMN "slug"`);
    }
} 