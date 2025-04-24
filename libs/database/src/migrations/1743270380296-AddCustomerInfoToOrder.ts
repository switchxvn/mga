import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddCustomerInfoToOrder1743270380296 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumns("orders", [
            new TableColumn({
                name: "customer_name",
                type: "varchar",
                length: "255",
                isNullable: true,
            }),
            new TableColumn({
                name: "customer_email",
                type: "varchar",
                length: "255",
                isNullable: true,
            })
        ]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumns("orders", ["customer_name", "customer_email"]);
    }
} 