import { MigrationInterface, QueryRunner } from "typeorm";

export class AddServiceThumbnail1743270380241 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "services" ADD COLUMN "thumbnail" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "thumbnail"`);
    }
} 