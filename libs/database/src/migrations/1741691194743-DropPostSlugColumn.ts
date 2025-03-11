import { MigrationInterface, QueryRunner } from "typeorm";

export class DropPostSlugColumn1741691194743 implements MigrationInterface {
    name = 'DropPostSlugColumn1741691194743'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop các cột SEO từ bảng posts vì sẽ chuyển sang dùng từ translations
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN IF EXISTS "slug"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN IF EXISTS "meta_title"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN IF EXISTS "meta_description"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN IF EXISTS "meta_keywords"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN IF EXISTS "og_title"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN IF EXISTS "og_description"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN IF EXISTS "og_image"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN IF EXISTS "canonical_url"`);

        // Thêm các cột SEO vào bảng post_translations
        await queryRunner.query(`ALTER TABLE "post_translations" ADD "short_description" text`);
        await queryRunner.query(`ALTER TABLE "post_translations" ADD "meta_title" character varying`);
        await queryRunner.query(`ALTER TABLE "post_translations" ADD "meta_description" text`);
        await queryRunner.query(`ALTER TABLE "post_translations" ADD "meta_keywords" character varying`);
        await queryRunner.query(`ALTER TABLE "post_translations" ADD "og_title" character varying`);
        await queryRunner.query(`ALTER TABLE "post_translations" ADD "og_description" text`);
        await queryRunner.query(`ALTER TABLE "post_translations" ADD "og_image" character varying`);
        await queryRunner.query(`ALTER TABLE "post_translations" ADD "canonical_url" character varying`);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop các cột SEO từ bảng post_translations
        await queryRunner.query(`ALTER TABLE "post_translations" DROP COLUMN "canonical_url"`);
        await queryRunner.query(`ALTER TABLE "post_translations" DROP COLUMN "og_image"`);
        await queryRunner.query(`ALTER TABLE "post_translations" DROP COLUMN "og_description"`);
        await queryRunner.query(`ALTER TABLE "post_translations" DROP COLUMN "og_title"`);
        await queryRunner.query(`ALTER TABLE "post_translations" DROP COLUMN "meta_keywords"`);
        await queryRunner.query(`ALTER TABLE "post_translations" DROP COLUMN "meta_description"`);
        await queryRunner.query(`ALTER TABLE "post_translations" DROP COLUMN "meta_title"`);
        await queryRunner.query(`ALTER TABLE "post_translations" DROP COLUMN "short_description"`);

        // Khôi phục lại các cột nếu cần rollback
        await queryRunner.query(`ALTER TABLE "posts" ADD "canonical_url" character varying`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "og_image" character varying`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "og_description" text`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "og_title" character varying`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "meta_keywords" character varying`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "meta_description" text`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "meta_title" character varying`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "slug" character varying`);
    }
} 