import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedPaymentMethods1743270380293 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO payment_methods (name, code, description)
            VALUES 
            ('PayOS', 'PAYOS', 'Thanh toán qua PayOS - Chuyển khoản ngân hàng với mã QR'),
            ('VNPay', 'VNPAY', 'Thanh toán qua VNPay - Đang phát triển'),
            ('Momo', 'MOMO', 'Thanh toán qua ví Momo - Đang phát triển')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM payment_methods`);
    }
} 