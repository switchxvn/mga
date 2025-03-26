import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFeatureServicesSection1743000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Get active theme id
        const activeTheme = await queryRunner.query(`
            SELECT id FROM themes WHERE is_active = true LIMIT 1
        `);

        if (!activeTheme?.length) {
            throw new Error('No active theme found');
        }

        const themeId = activeTheme[0].id;

        // Insert new section with type 'feature_services'
        await queryRunner.query(`
            INSERT INTO theme_sections (
                theme_id,
                type,
                component_name,
                title,
                "order",
                page_type,
                settings,
                is_active,
                created_at,
                updated_at
            ) VALUES (
                ${themeId},
                'feature_services',
                'FeatureServicesSection',
                'DỊCH VỤ XE NÂNG HÀNG',
                50,
                'home_page',
                '{
                    "layout": "grid",
                    "columns": 4,
                    "services": [
                        {
                            "icon": "https://s3mga.sgp1.digitaloceanspaces.com/services-feature/1.webp",
                            "title": "PHỤ TÙNG XE NÂNG",
                            "description": "Không chỉ phân phối đa dạng các dòng xe nâng ở phân khúc tải trọng từ nhỏ tới lớn, các loại xe chuyên dụng phù hợp với ngành nghề."
                        },
                        {
                            "icon": "https://s3mga.sgp1.digitaloceanspaces.com/services-feature/2.webp",
                            "title": "YÊU CẦU BẢO DƯỠNG",
                            "description": "Không chỉ phân phối đa dạng các dòng xe nâng ở phân khúc tải trọng từ nhỏ tới lớn, các loại xe chuyên dụng phù hợp với ngành nghề."
                        },
                        {
                            "icon": "https://s3mga.sgp1.digitaloceanspaces.com/services-feature/3.webp",
                            "title": "SỬA CHỮA XE NÂNG",
                            "description": "Không chỉ phân phối đa dạng các dòng xe nâng ở phân khúc tải trọng từ nhỏ tới lớn, các loại xe chuyên dụng phù hợp với ngành nghề."
                        },
                        {
                            "icon": "https://s3mga.sgp1.digitaloceanspaces.com/services-feature/4.webp",
                            "title": "THUÊ XE NÂNG",
                            "description": "Không chỉ phân phối đa dạng các dòng xe nâng ở phân khúc tải trọng từ nhỏ tới lớn, các loại xe chuyên dụng phù hợp với ngành nghề."
                        }
                    ],
                    "gap": "2rem",
                    "background": {
                        "light": "#008EAA",
                        "dark": "#004455"
                    },
                    "border": {
                        "light": "#E5E7EB",
                        "dark": "#374151"
                    },
                    "padding": {
                        "top": "3rem",
                        "bottom": "3rem"
                    },
                    "cardStyle": {
                        "background": {
                            "light": "#FFFFFF",
                            "dark": "#1F2937"
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
                        "size": "4rem",
                        "color": {
                            "light": "#008EAA",
                            "dark": "#60A5FA"
                        },
                        "margin": "0 auto 1rem auto"
                    },
                    "titleStyle": {
                        "size": "lg",
                        "weight": "bold",
                        "color": {
                            "light": "#111827",
                            "dark": "#F9FAFB"
                        },
                        "margin": "1rem 0",
                        "textTransform": "uppercase"
                    },
                    "descriptionStyle": {
                        "size": "sm",
                        "color": {
                            "light": "#4B5563",
                            "dark": "#D1D5DB"
                        },
                        "margin": "0.5rem 0"
                    }
                }'::jsonb,
                true,
                NOW(),
                NOW()
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the feature_services section
        await queryRunner.query(`
            DELETE FROM theme_sections 
            WHERE type = 'feature_services' 
            AND component_name = 'FeatureServicesSection'
        `);
    }
}