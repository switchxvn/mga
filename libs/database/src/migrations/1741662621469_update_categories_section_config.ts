import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCategoriesSectionConfig1741662621469 implements MigrationInterface {
    name = 'UpdateCategoriesSectionConfig1741662621469'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update existing categories section type configuration
        await queryRunner.query(`
            UPDATE theme_sections 
            SET settings = jsonb_set(
                settings::jsonb,
                '{displayMode}',
                '"grid"'::jsonb,
                true
            )
            WHERE type = 'categories';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the display mode from settings
        await queryRunner.query(`
            UPDATE theme_sections 
            SET settings = settings::jsonb - 'displayMode'
            WHERE type = 'categories';
        `);
    }
} 