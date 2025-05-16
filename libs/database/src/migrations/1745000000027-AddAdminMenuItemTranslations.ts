import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAdminMenuItemTranslations1745000000027 implements MigrationInterface {
  name = 'AddAdminMenuItemTranslations1745000000027';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the translations table
    await queryRunner.query(`
      CREATE TABLE "admin_menu_item_translations" (
        "id" SERIAL NOT NULL,
        "admin_menu_item_id" integer NOT NULL,
        "locale" character varying(2) NOT NULL,
        "name" character varying(100) NOT NULL,
        CONSTRAINT "PK_admin_menu_item_translations" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "admin_menu_item_translations" 
      ADD CONSTRAINT "FK_admin_menu_item_translations_admin_menu_items" 
      FOREIGN KEY ("admin_menu_item_id") 
      REFERENCES "admin_menu_items"("id") 
      ON DELETE CASCADE
    `);

    // Get all existing menu items
    const menuItems = await queryRunner.query(`SELECT id, name FROM admin_menu_items`);

    // Insert translations for existing menu items (with 'en' locale)
    for (const item of menuItems) {
      await queryRunner.query(`
        INSERT INTO admin_menu_item_translations (admin_menu_item_id, locale, name)
        VALUES ($1, 'en', $2)
      `, [item.id, item.name]);
    }

    // Drop the name column from admin_menu_items
    await queryRunner.query(`ALTER TABLE "admin_menu_items" DROP COLUMN "name"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add the name column back to admin_menu_items
    await queryRunner.query(`ALTER TABLE "admin_menu_items" ADD "name" character varying(100)`);

    // Get all translations with 'en' locale
    const translations = await queryRunner.query(`
      SELECT admin_menu_item_id, name FROM admin_menu_item_translations
      WHERE locale = 'en'
    `);

    // Restore names from translations
    for (const translation of translations) {
      await queryRunner.query(`
        UPDATE admin_menu_items
        SET name = $1
        WHERE id = $2
      `, [translation.name, translation.admin_menu_item_id]);
    }

    // Drop the translations table
    await queryRunner.query(`
      ALTER TABLE "admin_menu_item_translations" 
      DROP CONSTRAINT "FK_admin_menu_item_translations_admin_menu_items"
    `);
    await queryRunner.query(`DROP TABLE "admin_menu_item_translations"`);
  }
} 