import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoryType1741365837593 implements MigrationInterface {
    name = 'AddCategoryType1741365837593'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tạo enum type cho category_type
        await queryRunner.query(`CREATE TYPE "public"."categories_category_type_enum" AS ENUM('news', 'product', 'both')`);
        
        // Thêm cột category_type vào bảng categories
        await queryRunner.query(`ALTER TABLE "categories" ADD "category_type" "public"."categories_category_type_enum" NOT NULL DEFAULT 'both'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa cột category_type
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN "category_type"`);
        
        // Xóa enum type
        await queryRunner.query(`DROP TYPE "public"."categories_category_type_enum"`);
    }
} 