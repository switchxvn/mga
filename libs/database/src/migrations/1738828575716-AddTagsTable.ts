import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTagsTable1738828575716 implements MigrationInterface {
    name = 'AddTagsTable1738828575716'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tags" (
            "id" SERIAL NOT NULL, 
            "name" character varying NOT NULL, 
            "description" character varying, 
            "slug" character varying NOT NULL, 
            "is_active" boolean NOT NULL DEFAULT true, 
            "color" character varying, 
            "order" integer NOT NULL DEFAULT 0, 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "UQ_d90243459a697eadb8ad56e9092" UNIQUE ("slug"), 
            CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id")
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "tags"`);
    }
} 