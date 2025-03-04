import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSeoTable1738828575716 implements MigrationInterface {
    name = 'CreateSeoTable1738828575716'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "seo" ("id" SERIAL NOT NULL, "title" character varying, "description" character varying, "og_title" character varying, "og_description" character varying, "og_image" character varying, "keywords" character varying, "canonical_url" character varying, "page_path" character varying NOT NULL, "robots_txt" character varying, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_page_path_unique" UNIQUE ("page_path"), CONSTRAINT "PK_seo_id" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "seo"`);
    }
} 