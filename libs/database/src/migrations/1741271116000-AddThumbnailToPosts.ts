import { MigrationInterface, QueryRunner } from "typeorm";

export class AddThumbnailToPosts1741271116000 implements MigrationInterface {
    name = 'AddThumbnailToPosts1741271116000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" ADD "thumbnail" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "thumbnail"`);
    }
} 