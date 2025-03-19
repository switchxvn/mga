import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDarkLightModeToLogo1742370706661 implements MigrationInterface {
    name = 'AddDarkLightModeToLogo1742370706661'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "logos" ADD "dark_mode_url" character varying`);
        await queryRunner.query(`ALTER TABLE "logos" ADD "light_mode_url" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "logos" DROP COLUMN "light_mode_url"`);
        await queryRunner.query(`ALTER TABLE "logos" DROP COLUMN "dark_mode_url"`);
    }
} 