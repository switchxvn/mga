import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMenuItemTranslations1741665484857 implements MigrationInterface {
    name = 'AddMenuItemTranslations1741665484857'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create menu_item_translations table
        await queryRunner.query(`CREATE TABLE "menu_item_translations" (
            "id" SERIAL NOT NULL, 
            "label" character varying NOT NULL,
            "locale" character varying(2) NOT NULL,
            "menu_item_id" integer NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_menu_item_translations" PRIMARY KEY ("id"),
            CONSTRAINT "UQ_menu_item_translation_locale" UNIQUE ("menu_item_id", "locale")
        )`);

        // Add foreign key constraint
        await queryRunner.query(`ALTER TABLE "menu_item_translations" 
            ADD CONSTRAINT "FK_menu_item_translations_menu_item" 
            FOREIGN KEY ("menu_item_id") 
            REFERENCES "menu_items"("id") 
            ON DELETE CASCADE 
            ON UPDATE NO ACTION`);

        // Copy existing labels to translations table for 'en' locale
        await queryRunner.query(`
            INSERT INTO "menu_item_translations" (label, locale, menu_item_id)
            SELECT label, 'en', id FROM "menu_items"
        `);

        // Add new column to track default locale
        await queryRunner.query(`ALTER TABLE "menu_items" ADD COLUMN "default_locale" character varying(2) NOT NULL DEFAULT 'en'`);

        // Remove the old label column (since it's now in translations)
        await queryRunner.query(`ALTER TABLE "menu_items" DROP COLUMN "label"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add back the label column
        await queryRunner.query(`ALTER TABLE "menu_items" ADD COLUMN "label" character varying`);

        // Copy back English translations to the label column
        await queryRunner.query(`
            UPDATE "menu_items" mi
            SET label = (
                SELECT label 
                FROM "menu_item_translations" mit 
                WHERE mit.menu_item_id = mi.id 
                AND mit.locale = 'en'
                LIMIT 1
            )
        `);

        // Make label NOT NULL after data is copied back
        await queryRunner.query(`ALTER TABLE "menu_items" ALTER COLUMN "label" SET NOT NULL`);

        // Remove the default_locale column
        await queryRunner.query(`ALTER TABLE "menu_items" DROP COLUMN "default_locale"`);

        // Remove foreign key and translations table
        await queryRunner.query(`ALTER TABLE "menu_item_translations" DROP CONSTRAINT "FK_menu_item_translations_menu_item"`);
        await queryRunner.query(`DROP TABLE "menu_item_translations"`);
    }
} 