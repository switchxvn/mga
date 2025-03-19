import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSlugToServiceTranslations1742372816681 implements MigrationInterface {
    name = 'AddSlugToServiceTranslations1742372816681'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_translations" ADD "slug" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_translations" DROP COLUMN "slug"`);
    }
} 