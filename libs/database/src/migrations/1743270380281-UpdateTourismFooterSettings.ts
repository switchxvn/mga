import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTourismFooterSettings1743270380281 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE footers 
            SET settings = jsonb_build_object(
                'verticalImage', jsonb_build_object(
                    'url', '/images/tourism/company-vertical.jpg',
                    'alt', 'Hình ảnh công ty'
                )
            )
            WHERE component_name = 'TourismFooter'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE footers 
            SET settings = '{}'::jsonb
            WHERE component_name = 'TourismFooter'
        `);
    }
} 