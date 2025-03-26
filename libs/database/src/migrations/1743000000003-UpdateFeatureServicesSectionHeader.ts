import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFeatureServicesSectionHeader1743000000003 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE theme_sections 
            SET settings = jsonb_set(
                settings,
                '{headerStyle}',
                '{
                    "background": {
                        "light": "bg-primary-600",
                        "dark": "dark:bg-primary-500"
                    },
                    "title": {
                        "fontSize": "text-2xl sm:text-3xl",
                        "useUppercase": true,
                        "color": {
                            "light": "text-white",
                            "dark": "text-white"
                        }
                    },
                    "viewAll": {
                        "show": false,
                        "text": "Xem tất cả",
                        "link": "/services"
                    }
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
            SET settings = settings - 'headerStyle'
            WHERE type = 'feature_services' 
            AND component_name = 'FeatureServicesSection';
        `);
    }
} 