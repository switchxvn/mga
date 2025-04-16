import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreatePaymentTables1743270380292 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create payment_methods table
        await queryRunner.createTable(
            new Table({
                name: "payment_methods",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "name",
                        type: "varchar",
                    },
                    {
                        name: "code",
                        type: "varchar",
                        isUnique: true,
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "is_active",
                        type: "boolean",
                        default: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            }),
            true
        );

        // Create payment_transactions table
        await queryRunner.createTable(
            new Table({
                name: "payment_transactions",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "payment_method_id",
                        type: "int",
                    },
                    {
                        name: "order_id",
                        type: "varchar",
                        isUnique: true,
                    },
                    {
                        name: "amount",
                        type: "decimal",
                        precision: 10,
                        scale: 2,
                    },
                    {
                        name: "currency",
                        type: "varchar",
                        default: "'VND'",
                    },
                    {
                        name: "status",
                        type: "varchar",
                        default: "'PENDING'",
                    },
                    {
                        name: "payment_url",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "qr_code",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "description",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "metadata",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "paid_at",
                        type: "timestamp",
                        isNullable: true,
                    },
                    {
                        name: "cancelled_at",
                        type: "timestamp",
                        isNullable: true,
                    },
                ],
            }),
            true
        );

        // Add foreign key
        await queryRunner.createForeignKey(
            "payment_transactions",
            new TableForeignKey({
                columnNames: ["payment_method_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "payment_methods",
                onDelete: "RESTRICT",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("payment_transactions");
        if (table) {
            const foreignKey = table.foreignKeys.find(
                (fk) => fk.columnNames.indexOf("payment_method_id") !== -1
            );
            if (foreignKey) {
                await queryRunner.dropForeignKey("payment_transactions", foreignKey);
            }
        }
        await queryRunner.dropTable("payment_transactions");
        await queryRunner.dropTable("payment_methods");
    }
} 