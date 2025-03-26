import { MigrationInterface, QueryRunner } from "typeorm";

export class FixMenuItemsSequence1742917167138 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Get the current maximum ID from the menu_items table
        const result = await queryRunner.query(
            `SELECT MAX(id) as max_id FROM menu_items`
        );
        const maxId = (result[0].max_id || 0) + 100; // Add a larger offset to avoid conflicts

        // Reset the sequence to start from a safe value
        await queryRunner.query(
            `ALTER SEQUENCE menu_items_id_seq RESTART WITH ${maxId}`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Nothing to do in down migration
    }
} 