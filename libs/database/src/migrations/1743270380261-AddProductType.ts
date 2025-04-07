import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductType1743270380261 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tạo enum ProductType
        await queryRunner.query(`
            CREATE TYPE "public"."product_type_enum" AS ENUM (
                'PHYSICAL', 'VOUCHER', 'TICKET', 'DIGITAL', 'SERVICE', 'SUBSCRIPTION'
            )
        `);

        // Thêm cột type vào bảng products
        await queryRunner.query(`
            ALTER TABLE "products" 
            ADD COLUMN "product_type" "public"."product_type_enum" NOT NULL DEFAULT 'PHYSICAL'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa cột type khỏi bảng products
        await queryRunner.query(`
            ALTER TABLE "products" 
            DROP COLUMN "product_type"
        `);

        // Xóa enum ProductType
        await queryRunner.query(`
            DROP TYPE "public"."product_type_enum"
        `);
    }
} 