import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductVariants1743270380262 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tạo bảng product_variants
        await queryRunner.query(`
            CREATE TABLE "product_variants" (
                "id" SERIAL NOT NULL,
                "product_id" integer NOT NULL,
                "sku" character varying,
                "price" decimal(10,2),
                "compare_price" decimal(10,2),
                "thumbnail" character varying,
                "gallery" json,
                "published" boolean NOT NULL DEFAULT true,
                "quantity" integer NOT NULL DEFAULT 0,
                "is_featured" boolean NOT NULL DEFAULT false,
                "is_new" boolean NOT NULL DEFAULT false,
                "is_sale" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_product_variants" PRIMARY KEY ("id")
            )
        `);

        // Tạo bảng product_variant_translations
        await queryRunner.query(`
            CREATE TABLE "product_variant_translations" (
                "id" SERIAL NOT NULL,
                "variant_id" integer NOT NULL,
                "locale" character varying(5) NOT NULL,
                "name" character varying,
                "description" text,
                "short_description" text,
                "meta_title" character varying,
                "meta_description" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_product_variant_translations" PRIMARY KEY ("id")
            )
        `);

        // Thêm khóa ngoại cho bảng product_variants
        await queryRunner.query(`
            ALTER TABLE "product_variants" 
            ADD CONSTRAINT "FK_product_variants_product" 
            FOREIGN KEY ("product_id") 
            REFERENCES "products"("id") 
            ON DELETE CASCADE
        `);

        // Thêm khóa ngoại cho bảng product_variant_translations
        await queryRunner.query(`
            ALTER TABLE "product_variant_translations" 
            ADD CONSTRAINT "FK_product_variant_translations_variant" 
            FOREIGN KEY ("variant_id") 
            REFERENCES "product_variants"("id") 
            ON DELETE CASCADE
        `);

        // Thêm index cho bảng product_variants
        await queryRunner.query(`
            CREATE INDEX "IDX_product_variants_product_id" 
            ON "product_variants" ("product_id")
        `);

        // Thêm index cho bảng product_variant_translations
        await queryRunner.query(`
            CREATE INDEX "IDX_product_variant_translations_variant_id" 
            ON "product_variant_translations" ("variant_id")
        `);

        // Thêm index cho bảng product_variant_translations
        await queryRunner.query(`
            CREATE INDEX "IDX_product_variant_translations_locale" 
            ON "product_variant_translations" ("locale")
        `);

        // Thêm unique constraint cho sku
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_product_variants_sku" 
            ON "product_variants" ("sku")
            WHERE "sku" IS NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa index
        await queryRunner.query(`DROP INDEX "IDX_product_variants_sku"`);
        await queryRunner.query(`DROP INDEX "IDX_product_variant_translations_locale"`);
        await queryRunner.query(`DROP INDEX "IDX_product_variant_translations_variant_id"`);
        await queryRunner.query(`DROP INDEX "IDX_product_variants_product_id"`);

        // Xóa khóa ngoại
        await queryRunner.query(`ALTER TABLE "product_variant_translations" DROP CONSTRAINT "FK_product_variant_translations_variant"`);
        await queryRunner.query(`ALTER TABLE "product_variants" DROP CONSTRAINT "FK_product_variants_product"`);

        // Xóa bảng
        await queryRunner.query(`DROP TABLE "product_variant_translations"`);
        await queryRunner.query(`DROP TABLE "product_variants"`);
    }
} 