import { MigrationInterface, QueryRunner } from "typeorm";

export class ServicesSchema1738828575716 implements MigrationInterface {
    name = 'ServicesSchema1738828575716'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "services" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "icon" character varying NOT NULL, "order" integer NOT NULL DEFAULT 0, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "services"`);
    }
} 