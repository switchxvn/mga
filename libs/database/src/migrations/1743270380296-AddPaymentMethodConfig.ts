import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPaymentMethodConfig1743270380296 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new columns to payment_methods table
        await queryRunner.addColumns(
            "payment_methods",
            [
                new TableColumn({
                    name: "config",
                    type: "jsonb",
                    isNullable: true,
                    comment: "Payment method configuration (e.g. API keys, credentials)"
                }),
                new TableColumn({
                    name: "icon",
                    type: "varchar",
                    isNullable: true,
                    comment: "Payment method icon URL"
                }),
                new TableColumn({
                    name: "position",
                    type: "int",
                    default: 0,
                    comment: "Display position order"
                })
            ]
        );

        // Add PayOS payment method with config
        await queryRunner.query(`
            INSERT INTO payment_methods (
                name, 
                code, 
                description, 
                config, 
                icon,
                position,
                is_active
            )
            VALUES (
                'PayOS - VNPay',
                'PAYOS',
                'Thanh toán qua thẻ ATM/Visa/Master/JCB/QR VNPay',
                '{"clientId": "", "apiKey": "", "checksumKey": ""}',
                '/images/payment/payos.png',
                1,
                true
            )
            ON CONFLICT (code) DO UPDATE
            SET 
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                config = COALESCE(payment_methods.config, EXCLUDED.config),
                icon = EXCLUDED.icon,
                position = EXCLUDED.position
            WHERE payment_methods.code = 'PAYOS'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove columns from payment_methods table
        await queryRunner.dropColumns("payment_methods", ["config", "icon", "position"]);
    }
} 