import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageQrCodeToOrderItem1743270380308 implements MigrationInterface {
    name = 'AddImageQrCodeToOrderItem1743270380308'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" ADD "image_qr_code" character varying`);
        await queryRunner.query(`COMMENT ON COLUMN "order_items"."image_qr_code" IS 'URL of the QR code image stored in S3'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "image_qr_code"`);
    }
} 