import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShortDescriptionToPosts1741272459000 implements MigrationInterface {
    name = 'AddShortDescriptionToPosts1741272459000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" ADD "short_description" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "short_description"`);
    }
} 