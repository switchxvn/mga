import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderCodeAndPaymentDescription1743270380307 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // First add the column without constraints
        await queryRunner.query(`
            ALTER TABLE "orders" 
            ADD COLUMN "order_code" varchar(50);
        `);

        // Update existing orders with unique order codes
        await queryRunner.query(`
            WITH NUMBERED_ORDERS AS (
                SELECT 
                    id,
                    created_at,
                    ROW_NUMBER() OVER (ORDER BY created_at, id) as rn
                FROM "orders"
            )
            UPDATE "orders" o
            SET "order_code" = CONCAT(
                TO_CHAR(no.created_at, 'YYYYMMDD'),
                LPAD(CAST(no.rn AS VARCHAR), 4, '0'),
                UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4))
            )
            FROM NUMBERED_ORDERS no
            WHERE o.id = no.id;
        `);

        // Now add the constraints
        await queryRunner.query(`
            ALTER TABLE "orders" 
            ALTER COLUMN "order_code" SET NOT NULL,
            ADD CONSTRAINT "orders_order_code_unique" UNIQUE ("order_code");
        `);

        // Add payment description setting
        await queryRunner.query(`
            INSERT INTO "settings" ("key", "value", "group", "description", "is_public")
            VALUES (
                'payment_description_template', 
                'Thanh toán đơn hàng {order_code}', 
                'payment',
                'Template for payment description. Available variables: {order_code}',
                true
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove payment description setting
        await queryRunner.query(`
            DELETE FROM "settings" 
            WHERE "key" = 'payment_description_template';
        `);

        // Remove constraints first
        await queryRunner.query(`
            ALTER TABLE "orders" 
            DROP CONSTRAINT "orders_order_code_unique";
        `);

        // Remove order_code column
        await queryRunner.query(`
            ALTER TABLE "orders" 
            DROP COLUMN "order_code";
        `);
    }
} 