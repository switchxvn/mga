import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddThemeSectionTranslations1745000000028 implements MigrationInterface {
  name = 'AddThemeSectionTranslations1745000000028';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the translations table
    await queryRunner.query(`
      CREATE TABLE "theme_section_translations" (
        "id" SERIAL NOT NULL,
        "section_id" integer NOT NULL,
        "locale" character varying(2) NOT NULL,
        "title" character varying(255) NOT NULL,
        "description" text,
        "settings" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_theme_section_translations" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "theme_section_translations" 
      ADD CONSTRAINT "FK_theme_section_translations_theme_sections" 
      FOREIGN KEY ("section_id") 
      REFERENCES "theme_sections"("id") 
      ON DELETE CASCADE
    `);

    // Get all existing theme sections
    const sections = await queryRunner.query(`SELECT id, title, settings FROM theme_sections`);

    // Insert translations for existing sections (with 'en' locale)
    for (const section of sections) {
      await queryRunner.query(`
        INSERT INTO theme_section_translations (section_id, locale, title, settings)
        VALUES ($1, 'en', $2, $3)
      `, [section.id, section.title || '', section.settings]);
    }

    // Make title nullable in the theme_sections table (not dropping it yet for backward compatibility)
    await queryRunner.query(`ALTER TABLE "theme_sections" ALTER COLUMN "title" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Make title required again
    await queryRunner.query(`ALTER TABLE "theme_sections" ALTER COLUMN "title" SET NOT NULL`);

    // Get all translations with 'en' locale
    const translations = await queryRunner.query(`
      SELECT section_id, title, settings FROM theme_section_translations
      WHERE locale = 'en'
    `);

    // Restore titles and settings from translations
    for (const translation of translations) {
      await queryRunner.query(`
        UPDATE theme_sections
        SET title = $1, settings = $2
        WHERE id = $3
      `, [translation.title, translation.settings, translation.section_id]);
    }

    // Drop the translations table
    await queryRunner.query(`
      ALTER TABLE "theme_section_translations" 
      DROP CONSTRAINT "FK_theme_section_translations_theme_sections"
    `);
    await queryRunner.query(`DROP TABLE "theme_section_translations"`);
  }
} 