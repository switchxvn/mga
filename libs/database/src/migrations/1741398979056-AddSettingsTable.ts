import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSettingsTable1741398979056 implements MigrationInterface {
    name = 'AddSettingsTable1741398979056'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "settings" (
            "id" SERIAL NOT NULL, 
            "key" character varying NOT NULL, 
            "value" text NOT NULL, 
            "group" character varying, 
            "description" character varying, 
            "is_public" boolean NOT NULL DEFAULT false, 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "UQ_dc0fe14e6d9953a83f5ed5fb382" UNIQUE ("key"), 
            CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id")
        )`);

        // Thêm dữ liệu mặc định cho setting cho phép thêm vào giỏ hàng
        await queryRunner.query(`INSERT INTO "settings" ("key", "value", "group", "description", "is_public") 
        VALUES ('enable_add_to_cart', 'true', 'shop', 'Cho phép thêm sản phẩm vào giỏ hàng', true)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "settings"`);
    }
} 