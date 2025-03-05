import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSeoFieldsToPosts1741147957000 implements MigrationInterface {
    name = 'AddSeoFieldsToPosts1741147957000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Thêm cột slug
        await queryRunner.query(`ALTER TABLE "posts" ADD "slug" character varying`);
        
        // Thêm các cột meta
        await queryRunner.query(`ALTER TABLE "posts" ADD "meta_title" character varying`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "meta_description" text`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "meta_keywords" character varying`);
        
        // Thêm các cột Open Graph
        await queryRunner.query(`ALTER TABLE "posts" ADD "og_title" character varying`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "og_description" text`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "og_image" character varying`);
        
        // Thêm cột canonical URL
        await queryRunner.query(`ALTER TABLE "posts" ADD "canonical_url" character varying`);
        
        // Tạo index cho slug để tối ưu tìm kiếm
        await queryRunner.query(`CREATE INDEX "IDX_posts_slug" ON "posts" ("slug")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa index
        await queryRunner.query(`DROP INDEX "IDX_posts_slug"`);
        
        // Xóa các cột theo thứ tự ngược lại
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "canonical_url"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "og_image"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "og_description"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "og_title"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "meta_keywords"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "meta_description"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "meta_title"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "slug"`);
    }
} 