import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateOrderCustomerFields1743270380300 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add customer_name column if not exists
        await queryRunner.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'orders' AND column_name = 'customer_name'
                ) THEN
                    ALTER TABLE "orders" ADD COLUMN "customer_name" character varying;
                END IF;
            END $$;
        `);

        // Copy customerEmail to email if email is null
        await queryRunner.query(`
            UPDATE "orders" 
            SET "email" = "customer_email"
            WHERE "email" IS NULL AND "customer_email" IS NOT NULL;
        `);

        // Drop customerEmail column
        await queryRunner.query(`
            ALTER TABLE "orders" DROP COLUMN IF EXISTS "customer_email";
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Add back customerEmail column
        await queryRunner.query(`
            ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "customer_email" character varying;
        `);

        // Copy email back to customerEmail
        await queryRunner.query(`
            UPDATE "orders" 
            SET "customer_email" = "email"
            WHERE "customer_email" IS NULL AND "email" IS NOT NULL;
        `);

        // Drop customer_name column
        await queryRunner.query(`
            ALTER TABLE "orders" DROP COLUMN IF EXISTS "customer_name";
        `);
    }
} 