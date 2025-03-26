import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFeatureServicesSectionCardAndTitleConfig1743000000006 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE theme_sections 
            SET settings = jsonb_set(
                settings,
                '{cardStyle}',
                '{
                    "height": "200px",
                    "padding": "1.5rem",
                    "textAlign": "center",
                    "background": {
                        "dark": "transparent",
                        "light": "transparent"
                    },
                    "transition": "all 0.3s ease"
                }'::jsonb,
                true
            )
            WHERE type = 'feature_services' 
            AND component_name = 'FeatureServicesSection';

            UPDATE theme_sections 
            SET settings = jsonb_set(
                settings,
                '{titleStyle}',
                '{
                    "size": "lg",
                    "color": {
                        "dark": "#F9FAFB",
                        "light": "#111827"
                    },
                    "margin": "1rem 0",
                    "weight": "bold",
                    "textTransform": "uppercase",
                    "fontWeight": "700"
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
                '{cardStyle}',
                '{
                    "padding": "1.5rem",
                    "textAlign": "center",
                    "background": {
                        "dark": "transparent",
                        "light": "transparent"
                    },
                    "transition": "all 0.3s ease"
                }'::jsonb,
                true
            )
            WHERE type = 'feature_services' 
            AND component_name = 'FeatureServicesSection';

            UPDATE theme_sections 
            SET settings = jsonb_set(
                settings,
                '{titleStyle}',
                '{
                    "size": "lg",
                    "color": {
                        "dark": "#F9FAFB",
                        "light": "#111827"
                    },
                    "margin": "1rem 0",
                    "weight": "bold",
                    "textTransform": "uppercase"
                }'::jsonb,
                true
            )
            WHERE type = 'feature_services' 
            AND component_name = 'FeatureServicesSection';
        `);
    }
} 