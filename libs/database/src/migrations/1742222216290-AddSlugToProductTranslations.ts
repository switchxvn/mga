import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSlugToProductTranslations1742222216290 implements MigrationInterface {
    name = 'AddSlugToProductTranslations1742222216290'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add slug column to product_translations table
        await queryRunner.query(`ALTER TABLE "product_translations" ADD "slug" character varying`);
        
        // Create index for faster lookups
        await queryRunner.query(`CREATE INDEX "IDX_product_translations_slug" ON "product_translations" ("slug")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the index first
        await queryRunner.query(`DROP INDEX "IDX_product_translations_slug"`);
        
        // Drop the slug column
        await queryRunner.query(`ALTER TABLE "product_translations" DROP COLUMN "slug"`);
    }
} 