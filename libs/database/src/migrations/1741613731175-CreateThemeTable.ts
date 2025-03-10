import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateThemeTable1741613731175 implements MigrationInterface {
    name = 'CreateThemeTable1741613731175'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "themes" (
            "id" SERIAL NOT NULL,
            "name" character varying(255) NOT NULL,
            "colors" jsonb,
            "homepage_layout" jsonb,
            "slider_config" jsonb,
            "is_active" boolean NOT NULL DEFAULT false,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_themes" PRIMARY KEY ("id")
        )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "themes"`);
    }
} 