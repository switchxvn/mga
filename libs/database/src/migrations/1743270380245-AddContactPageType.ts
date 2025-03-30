import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContactPageType1743270380245 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add 'contact_page' to the enum
        await queryRunner.query(`
            ALTER TYPE theme_sections_page_type_enum ADD VALUE IF NOT EXISTS 'contact_page';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Note: PostgreSQL does not support removing values from enums
        // We would need to create a new enum and replace the old one to remove values
        // For now, we'll leave the value in place during rollback
    }
} 