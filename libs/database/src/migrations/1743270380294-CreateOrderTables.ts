import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateOrderTables1743270380294 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create orders table
        await queryRunner.createTable(
            new Table({
                name: "orders",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "user_id",
                        type: "uuid",
                        isNullable: true,
                    },
                    {
                        name: "status",
                        type: "enum",
                        enum: ["pending", "processing", "completed", "cancelled"],
                        default: "'pending'",
                    },
                    {
                        name: "total_amount",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                    },
                    {
                        name: "shipping_address",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "billing_address",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "payment_method",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "payment_status",
                        type: "enum",
                        enum: ["pending", "paid", "failed"],
                        default: "'pending'",
                    },
                    {
                        name: "notes",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true
        );

        // Create order_items table
        await queryRunner.createTable(
            new Table({
                name: "order_items",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "order_id",
                        type: "int",
                    },
                    {
                        name: "product_id",
                        type: "int",
                    },
                    {
                        name: "quantity",
                        type: "int",
                    },
                    {
                        name: "unit_price",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                    },
                    {
                        name: "total_price",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true
        );

        // Add foreign key for order_items to orders
        await queryRunner.createForeignKey(
            "order_items",
            new TableForeignKey({
                columnNames: ["order_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "orders",
                onDelete: "CASCADE",
            })
        );

        // Add foreign key for order_items to products
        await queryRunner.createForeignKey(
            "order_items",
            new TableForeignKey({
                columnNames: ["product_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "products",
                onDelete: "SET NULL",
            })
        );

        // Add foreign key for orders to users
        await queryRunner.createForeignKey(
            "orders",
            new TableForeignKey({
                columnNames: ["user_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "SET NULL",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys first
        const orderItemsTable = await queryRunner.getTable("order_items");
        const ordersTable = await queryRunner.getTable("orders");
        
        if (orderItemsTable) {
            const foreignKeys = orderItemsTable.foreignKeys;
            for (const foreignKey of foreignKeys) {
                await queryRunner.dropForeignKey("order_items", foreignKey);
            }
        }

        if (ordersTable) {
            const foreignKeys = ordersTable.foreignKeys;
            for (const foreignKey of foreignKeys) {
                await queryRunner.dropForeignKey("orders", foreignKey);
            }
        }

        // Then drop tables
        await queryRunner.dropTable("order_items");
        await queryRunner.dropTable("orders");
    }
} 