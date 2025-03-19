import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertZaloSupport1742393508711 implements MigrationInterface {
    name = 'InsertZaloSupport1742393508711'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert Zalo support settings with direct chat link
        await queryRunner.query(`
            INSERT INTO settings ("key", "value", "group", "is_public", "created_at", "updated_at")
            VALUES ('zalo_support', 'https://zalo.me/0123456789', 'support', true, now(), now())
            ON CONFLICT ("key") DO UPDATE
            SET "value" = EXCLUDED.value
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM settings WHERE key = 'zalo_support'`);
    }
} 