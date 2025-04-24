import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductAttributes1743270380263 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tạo bảng product_attributes
        await queryRunner.query(`
            CREATE TABLE "product_attributes" (
                "id" SERIAL NOT NULL,
                "code" character varying,
                "published" boolean NOT NULL DEFAULT true,
                "position" integer NOT NULL DEFAULT 0,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_product_attributes" PRIMARY KEY ("id")
            )
        `);

        // Tạo bảng product_attribute_translations
        await queryRunner.query(`
            CREATE TABLE "product_attribute_translations" (
                "id" SERIAL NOT NULL,
                "attribute_id" integer NOT NULL,
                "locale" character varying(5) NOT NULL,
                "name" character varying,
                "description" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_product_attribute_translations" PRIMARY KEY ("id")
            )
        `);

        // Tạo bảng product_attribute_values
        await queryRunner.query(`
            CREATE TABLE "product_attribute_values" (
                "id" SERIAL NOT NULL,
                "attribute_id" integer NOT NULL,
                "code" character varying,
                "published" boolean NOT NULL DEFAULT true,
                "position" integer NOT NULL DEFAULT 0,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_product_attribute_values" PRIMARY KEY ("id")
            )
        `);

        // Tạo bảng product_attribute_value_translations
        await queryRunner.query(`
            CREATE TABLE "product_attribute_value_translations" (
                "id" SERIAL NOT NULL,
                "value_id" integer NOT NULL,
                "locale" character varying(5) NOT NULL,
                "name" character varying,
                "description" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_product_attribute_value_translations" PRIMARY KEY ("id")
            )
        `);

        // Tạo bảng product_variant_attribute_values (junction table)
        await queryRunner.query(`
            CREATE TABLE "product_variant_attribute_values" (
                "variant_id" integer NOT NULL,
                "value_id" integer NOT NULL,
                CONSTRAINT "PK_product_variant_attribute_values" PRIMARY KEY ("variant_id", "value_id")
            )
        `);

        // Thêm các foreign key
        await queryRunner.query(`
            ALTER TABLE "product_attribute_translations"
            ADD CONSTRAINT "FK_product_attribute_translations_attribute"
            FOREIGN KEY ("attribute_id")
            REFERENCES "product_attributes"("id")
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "product_attribute_values"
            ADD CONSTRAINT "FK_product_attribute_values_attribute"
            FOREIGN KEY ("attribute_id")
            REFERENCES "product_attributes"("id")
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "product_attribute_value_translations"
            ADD CONSTRAINT "FK_product_attribute_value_translations_value"
            FOREIGN KEY ("value_id")
            REFERENCES "product_attribute_values"("id")
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "product_variant_attribute_values"
            ADD CONSTRAINT "FK_product_variant_attribute_values_variant"
            FOREIGN KEY ("variant_id")
            REFERENCES "product_variants"("id")
            ON DELETE CASCADE
        `);

        await queryRunner.query(`
            ALTER TABLE "product_variant_attribute_values"
            ADD CONSTRAINT "FK_product_variant_attribute_values_value"
            FOREIGN KEY ("value_id")
            REFERENCES "product_attribute_values"("id")
            ON DELETE CASCADE
        `);

        // Thêm các index
        await queryRunner.query(`
            CREATE INDEX "IDX_product_attributes_code"
            ON "product_attributes"("code")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_product_attribute_translations_attribute_id"
            ON "product_attribute_translations"("attribute_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_product_attribute_translations_locale"
            ON "product_attribute_translations"("locale")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_product_attribute_values_attribute_id"
            ON "product_attribute_values"("attribute_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_product_attribute_values_code"
            ON "product_attribute_values"("code")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_product_attribute_value_translations_value_id"
            ON "product_attribute_value_translations"("value_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_product_attribute_value_translations_locale"
            ON "product_attribute_value_translations"("locale")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa các index
        await queryRunner.query(`DROP INDEX "IDX_product_attribute_value_translations_locale"`);
        await queryRunner.query(`DROP INDEX "IDX_product_attribute_value_translations_value_id"`);
        await queryRunner.query(`DROP INDEX "IDX_product_attribute_values_code"`);
        await queryRunner.query(`DROP INDEX "IDX_product_attribute_values_attribute_id"`);
        await queryRunner.query(`DROP INDEX "IDX_product_attribute_translations_locale"`);
        await queryRunner.query(`DROP INDEX "IDX_product_attribute_translations_attribute_id"`);
        await queryRunner.query(`DROP INDEX "IDX_product_attributes_code"`);

        // Xóa các foreign key
        await queryRunner.query(`ALTER TABLE "product_variant_attribute_values" DROP CONSTRAINT "FK_product_variant_attribute_values_value"`);
        await queryRunner.query(`ALTER TABLE "product_variant_attribute_values" DROP CONSTRAINT "FK_product_variant_attribute_values_variant"`);
        await queryRunner.query(`ALTER TABLE "product_attribute_value_translations" DROP CONSTRAINT "FK_product_attribute_value_translations_value"`);
        await queryRunner.query(`ALTER TABLE "product_attribute_values" DROP CONSTRAINT "FK_product_attribute_values_attribute"`);
        await queryRunner.query(`ALTER TABLE "product_attribute_translations" DROP CONSTRAINT "FK_product_attribute_translations_attribute"`);

        // Xóa các bảng
        await queryRunner.query(`DROP TABLE "product_variant_attribute_values"`);
        await queryRunner.query(`DROP TABLE "product_attribute_value_translations"`);
        await queryRunner.query(`DROP TABLE "product_attribute_values"`);
        await queryRunner.query(`DROP TABLE "product_attribute_translations"`);
        await queryRunner.query(`DROP TABLE "product_attributes"`);
    }
} 