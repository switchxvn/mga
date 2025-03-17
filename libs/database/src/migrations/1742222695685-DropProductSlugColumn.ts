import { MigrationInterface, QueryRunner } from "typeorm";

export class DropProductSlugColumn1742222695685 implements MigrationInterface {
    name = 'DropProductSlugColumn1742222695685'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop slug column from products table since we're using it from translations
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "slug"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add back the slug column if we need to rollback
        await queryRunner.query(`ALTER TABLE "products" ADD "slug" character varying`);
    }
} 