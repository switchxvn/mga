import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFooterSettings1743270380280 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add settings column
        await queryRunner.query(`
            ALTER TABLE footers 
            ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb
        `);

        // Update settings for TourismFooter
        await queryRunner.query(`
            UPDATE footers 
            SET settings = jsonb_build_object(
                'verticalImage', jsonb_build_object(
                    'url', 'https://example.com/vertical-image.jpg',
                    'alt', 'Vertical Company Image'
                )
            )
            WHERE component_name = 'TourismFooter'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE footers 
            DROP COLUMN IF EXISTS settings
        `);
    }
} 