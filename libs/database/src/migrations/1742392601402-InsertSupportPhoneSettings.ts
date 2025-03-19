import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertSupportPhoneSettings1742392601402 implements MigrationInterface {
    name = 'InsertSupportPhoneSettings1742392601402'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // First create settings table if not exists
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "settings" (
                "id" SERIAL NOT NULL,
                "key" character varying NOT NULL,
                "value" jsonb NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_c6dcf1cd344ab54a28e21c87e84" UNIQUE ("key"),
                CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id")
            )
        `);

        // Insert support phone numbers
        await queryRunner.query(`
            INSERT INTO settings ("key", "value")
            VALUES ('support_phones', '["0123456789", "0987654321", "0369852147"]'::jsonb)
            ON CONFLICT ("key") DO UPDATE
            SET "value" = EXCLUDED.value
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM settings WHERE key = 'support_phones'`);
    }
} 