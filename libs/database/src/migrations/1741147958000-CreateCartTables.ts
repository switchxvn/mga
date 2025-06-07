import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCartTables1741147958000 implements MigrationInterface {
    name = 'CreateCartTables1741147958000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create carts table
        await queryRunner.query(`
            CREATE TABLE "carts" (
                "id" SERIAL NOT NULL,
                "user_id" uuid,
                "session_id" character varying(255),
                "expires_at" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_carts" PRIMARY KEY ("id")
            )
        `);

        // Create cart_items table
        await queryRunner.query(`
            CREATE TABLE "cart_items" (
                "id" SERIAL NOT NULL,
                "cart_id" integer NOT NULL,
                "product_id" integer NOT NULL,
                "variant_id" integer,
                "quantity" integer NOT NULL DEFAULT 1,
                "unit_price" numeric(10,2) NOT NULL,
                "discount_percent" numeric(5,2) NOT NULL DEFAULT 0,
                "final_price" numeric(10,2) NOT NULL,
                "metadata" jsonb,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_cart_items" PRIMARY KEY ("id")
            )
        `);

        // Create indexes
        await queryRunner.query(`CREATE INDEX "IDX_carts_user_id" ON "carts" ("user_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_carts_session_id" ON "carts" ("session_id")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_cart_items_unique" ON "cart_items" ("cart_id", "product_id", "variant_id")`);

        // Create foreign keys
        await queryRunner.query(`
            ALTER TABLE "cart_items" 
            ADD CONSTRAINT "FK_cart_items_cart_id" 
            FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "cart_items" 
            ADD CONSTRAINT "FK_cart_items_product_id" 
            FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "cart_items" 
            ADD CONSTRAINT "FK_cart_items_variant_id" 
            FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_cart_items_variant_id"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_cart_items_product_id"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_cart_items_cart_id"`);

        // Drop indexes
        await queryRunner.query(`DROP INDEX "IDX_cart_items_unique"`);
        await queryRunner.query(`DROP INDEX "IDX_carts_session_id"`);
        await queryRunner.query(`DROP INDEX "IDX_carts_user_id"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE "cart_items"`);
        await queryRunner.query(`DROP TABLE "carts"`);
    }
} 