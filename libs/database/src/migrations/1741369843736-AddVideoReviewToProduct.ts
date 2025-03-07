import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVideoReviewToProduct1741369843736 implements MigrationInterface {
    name = 'AddVideoReviewToProduct1741369843736'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Thêm cột video_review vào bảng products
        await queryRunner.query(`ALTER TABLE "products" ADD "video_review" character varying`);
        
        // Thêm cột video_title vào bảng product_translations
        await queryRunner.query(`ALTER TABLE "product_translations" ADD "video_title" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa cột video_title khỏi bảng product_translations
        await queryRunner.query(`ALTER TABLE "product_translations" DROP COLUMN "video_title"`);
        
        // Xóa cột video_review khỏi bảng products
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "video_review"`);
    }
} 