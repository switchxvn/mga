import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateThemeSectionType1741669839795 implements MigrationInterface {
    name = 'UpdateThemeSectionType1741669839795'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update type from 'categories' to 'product_categories'
        await queryRunner.query(`
            UPDATE theme_sections 
            SET type = 'product_categories' 
            WHERE type = 'categories'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert back from 'product_categories' to 'categories'
        await queryRunner.query(`
            UPDATE theme_sections 
            SET type = 'categories' 
            WHERE type = 'product_categories'
        `);
    }
} 