import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFoodMenuTables1743270380291 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create food_categories table
        await queryRunner.query(`
            CREATE TABLE "food_categories" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "is_active" boolean NOT NULL DEFAULT true,
                "order" integer NOT NULL DEFAULT 0,
                "image" jsonb,
                "settings" jsonb,
                CONSTRAINT "PK_food_categories" PRIMARY KEY ("id")
            )
        `);

        // Create food_categories_translations table
        await queryRunner.query(`
            CREATE TABLE "food_categories_translations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "name" character varying NOT NULL,
                "description" text,
                "slug" character varying NOT NULL,
                "meta_title" character varying,
                "meta_description" text,
                "language_code" character varying NOT NULL,
                "category_id" uuid NOT NULL,
                CONSTRAINT "PK_food_categories_translations" PRIMARY KEY ("id"),
                CONSTRAINT "FK_food_categories_translations_category" FOREIGN KEY ("category_id") REFERENCES "food_categories"("id") ON DELETE CASCADE
            )
        `);

        // Create food_items table
        await queryRunner.query(`
            CREATE TABLE "food_items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "is_active" boolean NOT NULL DEFAULT true,
                "order" integer NOT NULL DEFAULT 0,
                "price" decimal(10,2) NOT NULL,
                "discount_price" decimal(10,2),
                "is_featured" boolean NOT NULL DEFAULT false,
                "is_spicy" boolean NOT NULL DEFAULT false,
                "is_vegetarian" boolean NOT NULL DEFAULT false,
                "is_vegan" boolean NOT NULL DEFAULT false,
                "preparation_time" integer,
                "calories" integer,
                "image" jsonb,
                "gallery" jsonb,
                "settings" jsonb,
                "category_id" uuid NOT NULL,
                CONSTRAINT "PK_food_items" PRIMARY KEY ("id"),
                CONSTRAINT "FK_food_items_category" FOREIGN KEY ("category_id") REFERENCES "food_categories"("id") ON DELETE CASCADE
            )
        `);

        // Create food_items_translations table
        await queryRunner.query(`
            CREATE TABLE "food_items_translations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "name" character varying NOT NULL,
                "description" text,
                "slug" character varying NOT NULL,
                "meta_title" character varying,
                "meta_description" text,
                "ingredients" text[],
                "allergens" text[],
                "language_code" character varying NOT NULL,
                "item_id" uuid NOT NULL,
                CONSTRAINT "PK_food_items_translations" PRIMARY KEY ("id"),
                CONSTRAINT "FK_food_items_translations_item" FOREIGN KEY ("item_id") REFERENCES "food_items"("id") ON DELETE CASCADE
            )
        `);

        // Create indexes
        await queryRunner.query(`
            CREATE INDEX "IDX_food_categories_order" ON "food_categories" ("order")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_food_items_order" ON "food_items" ("order")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_food_items_category" ON "food_items" ("category_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_food_categories_translations_category" ON "food_categories_translations" ("category_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_food_items_translations_item" ON "food_items_translations" ("item_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_food_items_translations_item"`);
        await queryRunner.query(`DROP INDEX "IDX_food_categories_translations_category"`);
        await queryRunner.query(`DROP INDEX "IDX_food_items_category"`);
        await queryRunner.query(`DROP INDEX "IDX_food_items_order"`);
        await queryRunner.query(`DROP INDEX "IDX_food_categories_order"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "food_items_translations"`);
        await queryRunner.query(`DROP TABLE "food_items"`);
        await queryRunner.query(`DROP TABLE "food_categories_translations"`);
        await queryRunner.query(`DROP TABLE "food_categories"`);
    }
} 