import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFeatureServicesSectionConfig1743000000004 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE theme_sections 
            SET settings = '{
                "gap": "2rem",
                "border": {
                    "dark": "#FFFFFF",
                    "light": "#FFFFFF"
                },
                "layout": "grid",
                "columns": 4,
                "padding": {
                    "top": "2rem",
                    "bottom": "2rem"
                },
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
                "cardStyle": {
                    "border": {
                        "style": "solid",
                        "width": "1px",
                        "radius": "0.5rem"
                    },
                    "padding": "1.5rem",
                    "textAlign": "center",
                    "background": {
                        "dark": "transparent",
                        "light": "transparent"
                    },
                    "transition": "all 0.3s ease"
                },
                "iconStyle": {
                    "width": "5rem",
                    "color": {
                        "dark": "#FFFFFF",
                        "light": "#FFFFFF"
                    },
                    "margin": "0 auto 1rem auto"
                },
                "background": {
                    "dark": "#1a1a1a",
                    "light": "#FFFFFF"
                },
                "titleStyle": {
                    "size": "lg",
                    "color": {
                        "dark": "#F9FAFB",
                        "light": "#111827"
                    },
                    "margin": "1rem 0",
                    "weight": "bold",
                    "textTransform": "uppercase"
                },
                "description": "MGA Việt Nam tự hào là nhà phân phối độc quyền đa dạng các dòng xe nâng với nhiều phân khúc tải trọng và loại xe chuyên dụng. Chúng tôi không chỉ cung cấp xe nâng phù hợp với từng ngành nghề và môi trường làm việc cụ thể, mà còn đảm bảo dịch vụ hậu mãi toàn diện với phụ tùng chính hãng, bảo dưỡng định kỳ, sửa chữa chuyên nghiệp và cho thuê xe nâng linh hoạt. Với 8 chi nhánh và trung tâm dịch vụ trải dài từ Bắc vào Nam, MGA Việt Nam cam kết mang đến giải pháp xe nâng tối ưu với chi phí cạnh tranh nhất thị trường, đồng thời đảm bảo thời gian phản hồi nhanh chóng cho mọi yêu cầu của khách hàng trên toàn quốc.",
                "headerStyle": {
                    "title": {
                        "color": {
                            "dark": "text-white",
                            "light": "text-white"
                        },
                        "fontSize": "text-2xl sm:text-3xl",
                        "useUppercase": true
                    },
                    "viewAll": {
                        "link": "/services",
                        "show": false,
                        "text": "Xem tất cả"
                    },
                    "background": {
                        "dark": "dark:bg-primary-500",
                        "light": "bg-primary-600"
                    }
                },
                "descriptionStyle": {
                    "size": "base",
                    "color": {
                        "dark": "#FFFFFF",
                        "light": "#333333"
                    },
                    "border": {
                        "color": {
                            "dark": "#FFFFFF",
                            "light": "#017399"
                        },
                        "style": "solid",
                        "width": "1px",
                        "radius": "0.5rem"
                    },
                    "margin": "2rem auto 0",
                    "padding": "1.5rem",
                    "maxWidth": "1200px"
                }
            }'::jsonb
            WHERE type = 'feature_services' 
            AND component_name = 'FeatureServicesSection';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE theme_sections 
            SET settings = '{
                "gap": "2rem",
                "border": {
                    "dark": "#374151",
                    "light": "#E5E7EB"
                },
                "layout": "grid",
                "columns": 4,
                "padding": {
                    "top": "4rem",
                    "bottom": "4rem"
                },
                "services": [],
                "background": {
                    "dark": "#1a1a1a",
                    "light": "#FFFFFF"
                },
                "border": {
                    "light": "#E5E7EB",
                    "dark": "#374151"
                },
                "headerStyle": {
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
                },
                "iconStyle": {
                    "size": "4rem",
                    "margin": "0 auto 1rem"
                },
                "titleStyle": {
                    "size": "lg",
                    "weight": "semibold",
                    "color": {
                        "light": "#111827",
                        "dark": "#F9FAFB"
                    },
                    "margin": "0.5rem 0",
                    "textTransform": "uppercase"
                },
                "descriptionStyle": {
                    "size": "base",
                    "color": {
                        "light": "#374151",
                        "dark": "#D1D5DB"
                    },
                    "margin": "2rem auto 0",
                    "maxWidth": "800px",
                    "padding": "1.5rem",
                    "border": {
                        "width": "1px",
                        "style": "solid",
                        "color": {
                            "light": "#E5E7EB",
                            "dark": "#374151"
                        },
                        "radius": "0.5rem"
                    }
                }
            }'::jsonb
            WHERE type = 'feature_services' 
            AND component_name = 'FeatureServicesSection';
        `);
    }
} 