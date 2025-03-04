import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFooterTable1738828575716 implements MigrationInterface {
    name = 'AddFooterTable1738828575716'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "footers" (
            "id" SERIAL NOT NULL, 
            "name" character varying NOT NULL,
            "type" character varying NOT NULL,
            "content" jsonb NOT NULL DEFAULT '{}',
            "is_active" boolean NOT NULL DEFAULT false,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_footers" PRIMARY KEY ("id")
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "footers"`);
    }
} 