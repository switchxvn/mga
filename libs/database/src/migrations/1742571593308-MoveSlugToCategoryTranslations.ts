import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class MoveSlugToCategoryTranslations1742571593308 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Add slug column to category_translations
        await queryRunner.addColumn(
            "category_translations",
            new TableColumn({
                name: "slug",
                type: "varchar",
                isNullable: true
            })
        );

        // 2. Copy slug data from categories to translations
        await queryRunner.query(`
            UPDATE category_translations ct
            SET slug = (
                SELECT slug 
                FROM categories c 
                WHERE c.id = ct.category_id
            )
        `);

        // 3. Drop slug column from categories
        await queryRunner.dropColumn("categories", "slug");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. Add slug column back to categories
        await queryRunner.addColumn(
            "categories",
            new TableColumn({
                name: "slug",
                type: "varchar",
                isNullable: true
            })
        );

        // 2. Copy slug data back from translations to categories
        await queryRunner.query(`
            UPDATE categories c
            SET slug = (
                SELECT slug 
                FROM category_translations ct 
                WHERE ct.category_id = c.id 
                AND ct.locale = 'vi'
                LIMIT 1
            )
        `);

        // 3. Drop slug column from category_translations
        await queryRunner.dropColumn("category_translations", "slug");
    }
} 