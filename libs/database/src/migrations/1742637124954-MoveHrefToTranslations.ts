import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveHrefToTranslations1742637124954 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add href column to menu_item_translations
    await queryRunner.query(`
      ALTER TABLE menu_item_translations
      ADD COLUMN href character varying;
    `);

    // Copy href values from menu_items to menu_item_translations
    await queryRunner.query(`
      UPDATE menu_item_translations t
      SET href = m.href
      FROM menu_items m
      WHERE t.menu_item_id = m.id;
    `);

    // Make href NOT NULL in menu_item_translations
    await queryRunner.query(`
      ALTER TABLE menu_item_translations
      ALTER COLUMN href SET NOT NULL;
    `);

    // Drop href column from menu_items
    await queryRunner.query(`
      ALTER TABLE menu_items
      DROP COLUMN href;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add href column back to menu_items
    await queryRunner.query(`
      ALTER TABLE menu_items
      ADD COLUMN href character varying;
    `);

    // Copy href values from menu_item_translations back to menu_items
    // We'll take the href from the translation matching the default_locale
    await queryRunner.query(`
      UPDATE menu_items m
      SET href = t.href
      FROM menu_item_translations t
      WHERE t.menu_item_id = m.id
      AND t.locale = m.default_locale;
    `);

    // Make href NOT NULL in menu_items
    await queryRunner.query(`
      ALTER TABLE menu_items
      ALTER COLUMN href SET NOT NULL;
    `);

    // Drop href column from menu_item_translations
    await queryRunner.query(`
      ALTER TABLE menu_item_translations
      DROP COLUMN href;
    `);
  }
} 