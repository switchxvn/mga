import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class UpdateOrderTables1743270380295 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new columns to orders table
        await queryRunner.addColumns("orders", [
            new TableColumn({
                name: "phone_code",
                type: "varchar",
                isNullable: false,
            }),
            new TableColumn({
                name: "phone_number",
                type: "varchar",
                isNullable: false,
            }),
            new TableColumn({
                name: "email",
                type: "varchar",
                isNullable: true,
            })
        ]);

        // Add foreign key for phone_code
        await queryRunner.query(`
            ALTER TABLE "orders" 
            ADD CONSTRAINT "FK_orders_country_phone_codes" 
            FOREIGN KEY ("phone_code") 
            REFERENCES "country_phone_codes"("phone_code") 
            ON DELETE SET NULL
        `);

        // Add new columns to order_items table
        await queryRunner.addColumns("order_items", [
            new TableColumn({
                name: "product_type",
                type: "enum",
                enum: ["physical", "digital", "ticket"],
                default: "'physical'",
            }),
            new TableColumn({
                name: "is_used",
                type: "boolean",
                default: false,
            }),
            new TableColumn({
                name: "product_code",
                type: "varchar",
                length: "50",
                isNullable: true,
            }),
            new TableColumn({
                name: "qr_code",
                type: "varchar",
                isNullable: true,
            })
        ]);

        // Make shipping_address nullable in orders table since it's not required for digital products
        await queryRunner.query(`
            ALTER TABLE "orders" 
            ALTER COLUMN "shipping_address" DROP NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign key first
        await queryRunner.query(`
            ALTER TABLE "orders" 
            DROP CONSTRAINT "FK_orders_country_phone_codes"
        `);

        // Drop columns from orders table
        await queryRunner.dropColumns("orders", [
            "phone_code",
            "phone_number",
            "email"
        ]);

        // Drop columns from order_items table
        await queryRunner.dropColumns("order_items", [
            "product_type",
            "is_used",
            "product_code",
            "qr_code"
        ]);

        // Make shipping_address required again
        await queryRunner.query(`
            ALTER TABLE "orders" 
            ALTER COLUMN "shipping_address" SET NOT NULL
        `);
    }
} 