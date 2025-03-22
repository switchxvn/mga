import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class AddCategoryTranslations1742571593307 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Create category_translations table
        await queryRunner.createTable(
            new Table({
                name: "category_translations",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "name",
                        type: "varchar",
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "locale",
                        type: "varchar",
                        length: "2",
                    },
                    {
                        name: "meta_title",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "meta_description",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "meta_keywords",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "og_title",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "og_description",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "og_image",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "canonical_url",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "category_id",
                        type: "int",
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            }),
            true
        );

        // 2. Create foreign key
        await queryRunner.createForeignKey(
            "category_translations",
            new TableForeignKey({
                columnNames: ["category_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "categories",
                onDelete: "CASCADE",
            })
        );

        // 3. Create indexes
        await queryRunner.createIndex(
            "category_translations",
            new TableIndex({
                name: "IDX_CATEGORY_TRANSLATION_LOCALE",
                columnNames: ["locale"],
            })
        );

        await queryRunner.createIndex(
            "category_translations",
            new TableIndex({
                name: "IDX_CATEGORY_TRANSLATION_CATEGORY_ID",
                columnNames: ["category_id"],
            })
        );

        // 4. Copy existing data from categories to translations
        await queryRunner.query(`
            INSERT INTO category_translations (name, description, meta_title, meta_description, meta_keywords, og_title, og_description, og_image, canonical_url, category_id, locale)
            SELECT name, description, meta_title, meta_description, meta_keywords, og_title, og_description, og_image, canonical_url, id, 'vi'
            FROM categories;
        `);

        // 5. Drop columns from categories table
        await queryRunner.dropColumn("categories", "name");
        await queryRunner.dropColumn("categories", "description");
        await queryRunner.dropColumn("categories", "meta_title");
        await queryRunner.dropColumn("categories", "meta_description");
        await queryRunner.dropColumn("categories", "meta_keywords");
        await queryRunner.dropColumn("categories", "og_title");
        await queryRunner.dropColumn("categories", "og_description");
        await queryRunner.dropColumn("categories", "og_image");
        await queryRunner.dropColumn("categories", "canonical_url");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 1. Add back columns to categories table
        await queryRunner.query(`
            ALTER TABLE categories
            ADD COLUMN name varchar,
            ADD COLUMN description text NULL,
            ADD COLUMN meta_title varchar NULL,
            ADD COLUMN meta_description text NULL,
            ADD COLUMN meta_keywords varchar NULL,
            ADD COLUMN og_title varchar NULL,
            ADD COLUMN og_description text NULL,
            ADD COLUMN og_image varchar NULL,
            ADD COLUMN canonical_url varchar NULL;
        `);

        // 2. Copy data back from translations to categories
        await queryRunner.query(`
            UPDATE categories c
            SET name = (
                SELECT name FROM category_translations ct
                WHERE ct.category_id = c.id AND ct.locale = 'vi'
                LIMIT 1
            ),
            description = (
                SELECT description FROM category_translations ct
                WHERE ct.category_id = c.id AND ct.locale = 'vi'
                LIMIT 1
            ),
            meta_title = (
                SELECT meta_title FROM category_translations ct
                WHERE ct.category_id = c.id AND ct.locale = 'vi'
                LIMIT 1
            ),
            meta_description = (
                SELECT meta_description FROM category_translations ct
                WHERE ct.category_id = c.id AND ct.locale = 'vi'
                LIMIT 1
            ),
            meta_keywords = (
                SELECT meta_keywords FROM category_translations ct
                WHERE ct.category_id = c.id AND ct.locale = 'vi'
                LIMIT 1
            ),
            og_title = (
                SELECT og_title FROM category_translations ct
                WHERE ct.category_id = c.id AND ct.locale = 'vi'
                LIMIT 1
            ),
            og_description = (
                SELECT og_description FROM category_translations ct
                WHERE ct.category_id = c.id AND ct.locale = 'vi'
                LIMIT 1
            ),
            og_image = (
                SELECT og_image FROM category_translations ct
                WHERE ct.category_id = c.id AND ct.locale = 'vi'
                LIMIT 1
            ),
            canonical_url = (
                SELECT canonical_url FROM category_translations ct
                WHERE ct.category_id = c.id AND ct.locale = 'vi'
                LIMIT 1
            )
        `);

        // 3. Drop category_translations table and its indexes
        await queryRunner.dropTable("category_translations", true, true, true);
    }
} 