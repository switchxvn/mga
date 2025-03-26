import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFeatureServicesSectionStyles1743000000001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE theme_sections 
            SET settings = '{
                "layout": "grid",
                "columns": 4,
                "services": [
                    {
                        "icon": "https://s3mga.sgp1.digitaloceanspaces.com/services-feature/1.webp",
                        "title": "PHỤ TÙNG XE NÂNG"
                    },
                    {
                        "icon": "https://s3mga.sgp1.digitaloceanspaces.com/services-feature/2.webp",
                        "title": "YÊU CẦU BẢO DƯỠNG"
                    },
                    {
                        "icon": "https://s3mga.sgp1.digitaloceanspaces.com/services-feature/3.webp",
                        "title": "SỬA CHỮA XE NÂNG"
                    },
                    {
                        "icon": "https://s3mga.sgp1.digitaloceanspaces.com/services-feature/4.webp",
                        "title": "THUÊ XE NÂNG"
                    }
                ],
                "description": "Không chỉ phân phối đa dạng các dòng xe nâng ở phân khúc tải trọng từ nhỏ tới lớn, các loại xe chuyên dụng phù hợp với ngành nghề, khu vực làm việc khác nhau mà Hangchavn còn cung cấp phụ tùng chính hãng và các dịch vụ xe nâng toàn diện như: bảo dưỡng, sửa xe nâng, thuê xe nâng,...",
                "gap": "2rem",
                "background": {
                    "light": "#008EAA",
                    "dark": "#004455"
                },
                "border": {
                    "light": "#FFFFFF",
                    "dark": "#FFFFFF"
                },
                "padding": {
                    "top": "2rem",
                    "bottom": "2rem"
                },
                "cardStyle": {
                    "background": {
                        "light": "transparent",
                        "dark": "transparent"
                    },
                    "border": {
                        "width": "1px",
                        "style": "solid",
                        "radius": "0.5rem"
                    },
                    "padding": "1.5rem",
                    "transition": "all 0.3s ease",
                    "textAlign": "center"
                },
                "iconStyle": {
                    "size": "5rem",
                    "color": {
                        "light": "#FFFFFF",
                        "dark": "#FFFFFF"
                    },
                    "margin": "0 auto 1rem auto"
                },
                "titleStyle": {
                    "size": "lg",
                    "weight": "bold",
                    "color": {
                        "light": "#FFFFFF",
                        "dark": "#FFFFFF"
                    },
                    "margin": "1rem 0",
                    "textTransform": "uppercase"
                },
                "descriptionStyle": {
                    "size": "base",
                    "color": {
                        "light": "#FFFFFF",
                        "dark": "#FFFFFF"
                    },
                    "margin": "2rem auto 0",
                    "maxWidth": "1200px",
                    "padding": "1.5rem",
                    "border": {
                        "width": "1px",
                        "style": "solid",
                        "color": {
                            "light": "#FFFFFF",
                            "dark": "#FFFFFF"
                        },
                        "radius": "0.5rem"
                    }
                }
            }'::jsonb
            WHERE type = 'feature_services' 
            AND component_name = 'FeatureServicesSection';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert is not needed as the previous migration can restore the original state
        await queryRunner.query(`
            UPDATE theme_sections 
            SET settings = settings
            WHERE type = 'feature_services' 
            AND component_name = 'FeatureServicesSection';
        `);
    }
} 