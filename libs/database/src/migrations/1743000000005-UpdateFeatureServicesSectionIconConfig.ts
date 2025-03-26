import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFeatureServicesSectionIconConfig1743000000005 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE theme_sections 
            SET settings = jsonb_set(
                settings,
                '{iconStyle}',
                '{
                    "height": "5rem",
                    "color": {
                        "dark": "#FFFFFF",
                        "light": "#FFFFFF"
                    },
                    "margin": "0 auto 1rem auto"
                }'::jsonb,
                true
            )
            WHERE type = 'feature_services' 
            AND component_name = 'FeatureServicesSection';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE theme_sections 
            SET settings = jsonb_set(
                settings,
                '{iconStyle}',
                '{
                    "width": "5rem",
                    "color": {
                        "dark": "#FFFFFF",
                        "light": "#FFFFFF"
                    },
                    "margin": "0 auto 1rem auto"
                }'::jsonb,
                true
            )
            WHERE type = 'feature_services' 
            AND component_name = 'FeatureServicesSection';
        `);
    }
} 