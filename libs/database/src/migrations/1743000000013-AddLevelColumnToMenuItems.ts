import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLevelColumnToMenuItems1743000000013 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add level column with default value 0
        await queryRunner.query(`
            ALTER TABLE "menu_items" 
            ADD COLUMN "level" integer NOT NULL DEFAULT 0
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove level column
        await queryRunner.query(`
            ALTER TABLE "menu_items" 
            DROP COLUMN "level"
        `);
    }
} 