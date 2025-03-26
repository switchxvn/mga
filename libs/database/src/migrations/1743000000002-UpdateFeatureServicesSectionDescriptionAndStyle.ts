import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFeatureServicesSectionDescriptionAndStyle1743000000002 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE theme_sections 
            SET settings = jsonb_set(
                jsonb_set(
                    jsonb_set(
                        settings,
                        '{description}',
                        '"MGA Việt Nam tự hào là nhà phân phối độc quyền đa dạng các dòng xe nâng với nhiều phân khúc tải trọng và loại xe chuyên dụng. Chúng tôi không chỉ cung cấp xe nâng phù hợp với từng ngành nghề và môi trường làm việc cụ thể, mà còn đảm bảo dịch vụ hậu mãi toàn diện với phụ tùng chính hãng, bảo dưỡng định kỳ, sửa chữa chuyên nghiệp và cho thuê xe nâng linh hoạt. Với 8 chi nhánh và trung tâm dịch vụ trải dài từ Bắc vào Nam, MGA Việt Nam cam kết mang đến giải pháp xe nâng tối ưu với chi phí cạnh tranh nhất thị trường, đồng thời đảm bảo thời gian phản hồi nhanh chóng cho mọi yêu cầu của khách hàng trên toàn quốc."'::jsonb,
                        true
                    ),
                    '{background}',
                    '{
                        "light": "#FFFFFF",
                        "dark": "#1a1a1a"
                    }'::jsonb,
                    true
                ),
                '{titleStyle,color}',
                '{
                    "light": "#111827",
                    "dark": "#F9FAFB"
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
                jsonb_set(
                    jsonb_set(
                        settings,
                        '{description}',
                        '"Không chỉ phân phối đa dạng các dòng xe nâng ở phân khúc tải trọng từ nhỏ tới lớn, các loại xe chuyên dụng phù hợp với ngành nghề, khu vực làm việc khác nhau mà Hangchavn còn cung cấp phụ tùng chính hãng và các dịch vụ xe nâng toàn diện như: bảo dưỡng, sửa xe nâng, thuê xe nâng,..."'::jsonb,
                        true
                    ),
                    '{background}',
                    '{
                        "light": "#008EAA",
                        "dark": "#004455"
                    }'::jsonb,
                    true
                ),
                '{titleStyle,color}',
                '{
                    "light": "#FFFFFF",
                    "dark": "#FFFFFF"
                }'::jsonb,
                true
            )
            WHERE type = 'feature_services' 
            AND component_name = 'FeatureServicesSection';
        `);
    }
} 