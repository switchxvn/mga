import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUrlFromLogo1742370853351 implements MigrationInterface {
    name = 'RemoveUrlFromLogo1742370853351'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "logos" DROP COLUMN "url"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "logos" ADD "url" character varying NOT NULL`);
    }
} 