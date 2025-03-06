import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoriesSchema1738828575716 implements MigrationInterface {
    name = 'AddCategoriesSchema1738828575716'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "categories" (
            "id" SERIAL NOT NULL, 
            "name" character varying NOT NULL, 
            "slug" character varying, 
            "description" text, 
            "active" boolean NOT NULL DEFAULT true, 
            "is_featured" boolean NOT NULL DEFAULT false,
            "meta_title" character varying,
            "meta_description" text,
            "meta_keywords" character varying,
            "og_title" character varying,
            "og_description" text,
            "og_image" character varying,
            "canonical_url" character varying,
            "parent_id" integer,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
            
        await queryRunner.query(`CREATE TABLE "post_categories" (
            "category_id" integer NOT NULL, 
            "post_id" integer NOT NULL, 
            CONSTRAINT "PK_d41c4e3351b9a2be59344ddf703" PRIMARY KEY ("category_id", "post_id"))`);
            
        await queryRunner.query(`CREATE INDEX "IDX_8f0b5ce7216a6607f0eb8b7e25" ON "post_categories" ("category_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_593d471f89dde8ebd105d0e33a" ON "post_categories" ("post_id") `);
        
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_categories_parent_id" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_8f0b5ce7216a6607f0eb8b7e25a" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "post_categories" ADD CONSTRAINT "FK_593d471f89dde8ebd105d0e33ae" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_593d471f89dde8ebd105d0e33ae"`);
        await queryRunner.query(`ALTER TABLE "post_categories" DROP CONSTRAINT "FK_8f0b5ce7216a6607f0eb8b7e25a"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_categories_parent_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_593d471f89dde8ebd105d0e33a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8f0b5ce7216a6607f0eb8b7e25"`);
        await queryRunner.query(`DROP TABLE "post_categories"`);
        await queryRunner.query(`DROP TABLE "categories"`);
    }
} 