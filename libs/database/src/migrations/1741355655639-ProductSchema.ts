import { MigrationInterface, QueryRunner } from "typeorm";

export class ProductSchema1741355655639 implements MigrationInterface {
    name = 'ProductSchema1741355655639'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "products" ("id" SERIAL NOT NULL, "sku" character varying, "price" numeric(10,2), "compare_price" numeric(10,2), "thumbnail" character varying, "gallery" json, "published" boolean NOT NULL DEFAULT true, "quantity" integer NOT NULL DEFAULT '0', "is_featured" boolean NOT NULL DEFAULT false, "is_new" boolean NOT NULL DEFAULT false, "is_sale" boolean NOT NULL DEFAULT false, "slug" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_translations" ("id" SERIAL NOT NULL, "product_id" integer NOT NULL, "locale" character varying(2) NOT NULL, "title" character varying NOT NULL, "content" text, "short_description" text, "meta_title" character varying, "meta_description" text, "meta_keywords" character varying, "og_title" character varying, "og_description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a0a1c6dd8e87e9b7b69144d7a15" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "product_translations" ADD CONSTRAINT "FK_product_translations_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_translations" DROP CONSTRAINT "FK_product_translations_product_id"`);
        await queryRunner.query(`DROP TABLE "product_translations"`);
        await queryRunner.query(`DROP TABLE "products"`);
    }
} 