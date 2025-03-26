import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFeatureServicesSectionIconAndDescription1743000000007 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE theme_sections 
            SET settings = jsonb_set(
                settings,
                '{iconStyle}',
                '{
                    "height": "7rem",
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
                    "fontWeight": "900"
                }'::jsonb,
                true
            )
            WHERE type = 'feature_services' 
            AND component_name = 'FeatureServicesSection';

            UPDATE theme_sections 
            SET settings = jsonb_set(
                settings,
                '{descriptionStyle}',
                '{
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
                    "maxWidth": "100%"
                }'::jsonb,
                true
            )
            WHERE type = 'feature_services' 
            AND component_name = 'FeatureServicesSection';

            UPDATE theme_sections 
            SET settings = jsonb_set(
                settings,
                '{description}',
                '"<p>MGA Việt Nam tự hào là nhà phân phối độc quyền đa dạng các dòng xe nâng với nhiều phân khúc tải trọng và loại xe chuyên dụng. Chúng tôi không chỉ cung cấp xe nâng phù hợp với từng ngành nghề và môi trường làm việc cụ thể, mà còn đảm bảo dịch vụ hậu mãi toàn diện với phụ tùng chính hãng, bảo dưỡng định kỳ, sửa chữa chuyên nghiệp và cho thuê xe nâng linh hoạt.</p><p>Với 8 chi nhánh và trung tâm dịch vụ trải dài từ Bắc vào Nam, MGA Việt Nam cam kết mang đến giải pháp xe nâng tối ưu với chi phí cạnh tranh nhất thị trường, đồng thời đảm bảo thời gian phản hồi nhanh chóng cho mọi yêu cầu của khách hàng trên toàn quốc.</p>"'::jsonb,
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

            UPDATE theme_sections 
            SET settings = jsonb_set(
                settings,
                '{descriptionStyle}',
                '{
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
                }'::jsonb,
                true
            )
            WHERE type = 'feature_services' 
            AND component_name = 'FeatureServicesSection';

            UPDATE theme_sections 
            SET settings = jsonb_set(
                settings,
                '{description}',
                '"MGA Việt Nam tự hào là nhà phân phối độc quyền đa dạng các dòng xe nâng với nhiều phân khúc tải trọng và loại xe chuyên dụng. Chúng tôi không chỉ cung cấp xe nâng phù hợp với từng ngành nghề và môi trường làm việc cụ thể, mà còn đảm bảo dịch vụ hậu mãi toàn diện với phụ tùng chính hãng, bảo dưỡng định kỳ, sửa chữa chuyên nghiệp và cho thuê xe nâng linh hoạt. Với 8 chi nhánh và trung tâm dịch vụ trải dài từ Bắc vào Nam, MGA Việt Nam cam kết mang đến giải pháp xe nâng tối ưu với chi phí cạnh tranh nhất thị trường, đồng thời đảm bảo thời gian phản hồi nhanh chóng cho mọi yêu cầu của khách hàng trên toàn quốc."'::jsonb,
                true
            )
            WHERE type = 'feature_services' 
            AND component_name = 'FeatureServicesSection';
        `);
    }
} 