import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSeoFieldsToCategory1741431521231 implements MigrationInterface {
    name = 'AddSeoFieldsToCategory1741431521231'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Kiểm tra xem các cột đã tồn tại chưa trước khi thêm
        const columns = await queryRunner.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'categories'
        `);
        
        const columnNames = columns.map(col => col.column_name);
        
        // Thêm các cột SEO nếu chưa tồn tại
        if (!columnNames.includes('meta_title')) {
            await queryRunner.query(`
                ALTER TABLE "categories" ADD "meta_title" character varying
            `);
        }
        
        if (!columnNames.includes('meta_description')) {
            await queryRunner.query(`
                ALTER TABLE "categories" ADD "meta_description" text
            `);
        }
        
        if (!columnNames.includes('meta_keywords')) {
            await queryRunner.query(`
                ALTER TABLE "categories" ADD "meta_keywords" character varying
            `);
        }
        
        if (!columnNames.includes('og_title')) {
            await queryRunner.query(`
                ALTER TABLE "categories" ADD "og_title" character varying
            `);
        }
        
        if (!columnNames.includes('og_description')) {
            await queryRunner.query(`
                ALTER TABLE "categories" ADD "og_description" text
            `);
        }
        
        if (!columnNames.includes('og_image')) {
            await queryRunner.query(`
                ALTER TABLE "categories" ADD "og_image" character varying
            `);
        }
        
        if (!columnNames.includes('canonical_url')) {
            await queryRunner.query(`
                ALTER TABLE "categories" ADD "canonical_url" character varying
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa các cột SEO nếu cần rollback
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "meta_title"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "meta_description"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "meta_keywords"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "og_title"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "og_description"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "og_image"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "canonical_url"`);
    }
} 