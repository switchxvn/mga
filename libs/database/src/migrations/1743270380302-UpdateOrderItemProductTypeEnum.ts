import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOrderItemProductTypeEnum1743270380302 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First, drop the enum type constraint
        await queryRunner.query(`
            ALTER TABLE "order_items" 
            ALTER COLUMN "product_type" DROP DEFAULT;
        `);

        await queryRunner.query(`
            ALTER TABLE "order_items" 
            ALTER COLUMN "product_type" TYPE VARCHAR;
        `);

        // Drop the old enum type
        await queryRunner.query(`
            DROP TYPE IF EXISTS "order_items_product_type_enum";
        `);

        // Create new enum type with correct values
        await queryRunner.query(`
            CREATE TYPE "order_items_product_type_enum" AS ENUM ('PHYSICAL', 'DIGITAL', 'TICKET', 'VOUCHER', 'SERVICE', 'SUBSCRIPTION');
        `);

        // Update the column to use the new enum type
        await queryRunner.query(`
            ALTER TABLE "order_items" 
            ALTER COLUMN "product_type" TYPE order_items_product_type_enum 
            USING product_type::order_items_product_type_enum;
        `);

        // Set default value back
        await queryRunner.query(`
            ALTER TABLE "order_items" 
            ALTER COLUMN "product_type" SET DEFAULT 'PHYSICAL';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert back to original enum
        await queryRunner.query(`
            ALTER TABLE "order_items" 
            ALTER COLUMN "product_type" DROP DEFAULT;
        `);

        await queryRunner.query(`
            ALTER TABLE "order_items" 
            ALTER COLUMN "product_type" TYPE VARCHAR;
        `);

        await queryRunner.query(`
            DROP TYPE IF EXISTS "order_items_product_type_enum";
        `);

        await queryRunner.query(`
            CREATE TYPE "order_items_product_type_enum" AS ENUM ('PHYSICAL', 'DIGITAL', 'TICKET');
        `);

        await queryRunner.query(`
            ALTER TABLE "order_items" 
            ALTER COLUMN "product_type" TYPE order_items_product_type_enum 
            USING product_type::order_items_product_type_enum;
        `);

        await queryRunner.query(`
            ALTER TABLE "order_items" 
            ALTER COLUMN "product_type" SET DEFAULT 'PHYSICAL';
        `);
    }
} 