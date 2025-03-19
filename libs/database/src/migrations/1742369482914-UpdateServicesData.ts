import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateServicesData1742369482914 implements MigrationInterface {
    name = 'UpdateServicesData1742369482914'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Clear existing data
        await queryRunner.query(`TRUNCATE TABLE "service_translations" CASCADE`);
        await queryRunner.query(`TRUNCATE TABLE "services" CASCADE`);

        // Insert new services
        const services = [
            {
                icon: 'i-mdi-forklift',
                order: 1,
                translations: [
                    {
                        locale: 'en',
                        title: 'Forklift Sales',
                        description: 'New and used forklifts available for purchase. Wide range of brands and models to suit your needs.',
                        shortDescription: 'Quality new and used forklifts for sale',
                        metaTitle: 'Forklift Sales | New & Used Forklifts',
                        metaDescription: 'Browse our wide selection of new and used forklifts for sale. Find the perfect forklift for your business needs.',
                        metaKeywords: 'forklift sales, new forklifts, used forklifts, buy forklift',
                        ogTitle: 'Forklift Sales - New & Used Equipment',
                        ogDescription: 'Discover our extensive range of new and used forklifts. Quality equipment for every budget and requirement.'
                    },
                    {
                        locale: 'vi',
                        title: 'Bán Xe Nâng',
                        description: 'Cung cấp xe nâng mới và đã qua sử dụng. Đa dạng thương hiệu và mẫu mã phù hợp với nhu cầu của bạn.',
                        shortDescription: 'Xe nâng mới và đã qua sử dụng chất lượng cao',
                        metaTitle: 'Bán Xe Nâng | Xe Nâng Mới & Cũ',
                        metaDescription: 'Khám phá bộ sưu tập xe nâng mới và đã qua sử dụng đa dạng. Tìm xe nâng phù hợp cho doanh nghiệp của bạn.',
                        metaKeywords: 'bán xe nâng, xe nâng mới, xe nâng cũ, mua xe nâng',
                        ogTitle: 'Bán Xe Nâng - Thiết Bị Mới & Đã Qua Sử Dụng',
                        ogDescription: 'Khám phá đa dạng xe nâng mới và đã qua sử dụng. Thiết bị chất lượng cho mọi ngân sách và yêu cầu.'
                    }
                ]
            },
            {
                icon: 'i-mdi-truck-delivery',
                order: 2,
                translations: [
                    {
                        locale: 'en',
                        title: 'Forklift Rental',
                        description: 'Short-term and long-term forklift rental solutions. Flexible terms to match your operational requirements.',
                        shortDescription: 'Flexible forklift rental solutions',
                        metaTitle: 'Forklift Rental Services | Flexible Lease Options',
                        metaDescription: 'Rent forklifts for short or long-term periods. Flexible rental solutions to meet your business needs.',
                        metaKeywords: 'forklift rental, forklift lease, short term rental, long term rental',
                        ogTitle: 'Forklift Rental - Flexible Solutions',
                        ogDescription: 'Find the perfect forklift rental solution for your business. Short and long-term options available.'
                    },
                    {
                        locale: 'vi',
                        title: 'Cho Thuê Xe Nâng',
                        description: 'Giải pháp cho thuê xe nâng ngắn hạn và dài hạn. Điều khoản linh hoạt phù hợp với yêu cầu hoạt động của bạn.',
                        shortDescription: 'Giải pháp cho thuê xe nâng linh hoạt',
                        metaTitle: 'Dịch Vụ Cho Thuê Xe Nâng | Nhiều Lựa Chọn Linh Hoạt',
                        metaDescription: 'Cho thuê xe nâng ngắn hạn và dài hạn. Giải pháp linh hoạt đáp ứng nhu cầu doanh nghiệp của bạn.',
                        metaKeywords: 'cho thuê xe nâng, thuê xe nâng, thuê ngắn hạn, thuê dài hạn',
                        ogTitle: 'Cho Thuê Xe Nâng - Giải Pháp Linh Hoạt',
                        ogDescription: 'Tìm giải pháp cho thuê xe nâng phù hợp cho doanh nghiệp của bạn. Có sẵn các lựa chọn ngắn và dài hạn.'
                    }
                ]
            },
            {
                icon: 'i-mdi-tools',
                order: 3,
                translations: [
                    {
                        locale: 'en',
                        title: 'Maintenance & Repair',
                        description: 'Professional maintenance and repair services for all forklift brands. 24/7 emergency support available.',
                        shortDescription: 'Expert forklift maintenance and repair',
                        metaTitle: 'Forklift Maintenance & Repair Services | 24/7 Support',
                        metaDescription: 'Professional forklift maintenance and repair services. Available 24/7 for all brands and models.',
                        metaKeywords: 'forklift repair, forklift maintenance, emergency repair, 24/7 support',
                        ogTitle: 'Forklift Maintenance & Repair - 24/7 Service',
                        ogDescription: 'Expert maintenance and repair services for all forklift brands. Round-the-clock emergency support available.'
                    },
                    {
                        locale: 'vi',
                        title: 'Bảo Trì & Sửa Chữa',
                        description: 'Dịch vụ bảo trì và sửa chữa chuyên nghiệp cho tất cả các thương hiệu xe nâng. Hỗ trợ khẩn cấp 24/7.',
                        shortDescription: 'Dịch vụ bảo trì và sửa chữa xe nâng chuyên nghiệp',
                        metaTitle: 'Dịch Vụ Bảo Trì & Sửa Chữa Xe Nâng | Hỗ Trợ 24/7',
                        metaDescription: 'Dịch vụ bảo trì và sửa chữa xe nâng chuyên nghiệp. Hỗ trợ 24/7 cho mọi thương hiệu và model.',
                        metaKeywords: 'sửa chữa xe nâng, bảo trì xe nâng, sửa chữa khẩn cấp, hỗ trợ 24/7',
                        ogTitle: 'Bảo Trì & Sửa Chữa Xe Nâng - Dịch Vụ 24/7',
                        ogDescription: 'Dịch vụ bảo trì và sửa chữa chuyên nghiệp cho mọi thương hiệu xe nâng. Hỗ trợ khẩn cấp 24/7.'
                    }
                ]
            },
            {
                icon: 'i-mdi-cog-transfer',
                order: 4,
                translations: [
                    {
                        locale: 'en',
                        title: 'Spare Parts Supply',
                        description: 'Genuine spare parts for all major forklift brands. Fast delivery and competitive pricing.',
                        shortDescription: 'Quality forklift spare parts supply',
                        metaTitle: 'Forklift Spare Parts | Genuine Parts Supply',
                        metaDescription: 'Get genuine forklift spare parts for all major brands. Fast delivery and competitive prices guaranteed.',
                        metaKeywords: 'forklift parts, spare parts, genuine parts, parts supply',
                        ogTitle: 'Forklift Spare Parts - Genuine Parts Supply',
                        ogDescription: 'Quality spare parts for all major forklift brands. Fast delivery and competitive pricing available.'
                    },
                    {
                        locale: 'vi',
                        title: 'Cung Cấp Phụ Tùng',
                        description: 'Phụ tùng chính hãng cho tất cả các thương hiệu xe nâng lớn. Giao hàng nhanh và giá cả cạnh tranh.',
                        shortDescription: 'Cung cấp phụ tùng xe nâng chất lượng cao',
                        metaTitle: 'Phụ Tùng Xe Nâng | Cung Cấp Phụ Tùng Chính Hãng',
                        metaDescription: 'Cung cấp phụ tùng chính hãng cho mọi thương hiệu xe nâng. Đảm bảo giao hàng nhanh và giá cạnh tranh.',
                        metaKeywords: 'phụ tùng xe nâng, linh kiện xe nâng, phụ tùng chính hãng, cung cấp phụ tùng',
                        ogTitle: 'Phụ Tùng Xe Nâng - Cung Cấp Phụ Tùng Chính Hãng',
                        ogDescription: 'Phụ tùng chất lượng cho mọi thương hiệu xe nâng lớn. Giao hàng nhanh và giá cả cạnh tranh.'
                    }
                ]
            },
            {
                icon: 'i-mdi-account-hard-hat',
                order: 5,
                translations: [
                    {
                        locale: 'en',
                        title: 'Operator Training',
                        description: 'Certified forklift operator training programs. Comprehensive safety and operational training courses.',
                        shortDescription: 'Professional forklift operator training',
                        metaTitle: 'Forklift Operator Training | Certified Programs',
                        metaDescription: 'Get certified with our professional forklift operator training programs. Comprehensive safety and operational courses.',
                        metaKeywords: 'forklift training, operator certification, safety training, operational training',
                        ogTitle: 'Forklift Operator Training - Get Certified',
                        ogDescription: 'Professional forklift operator training programs. Get certified with our comprehensive safety and operational courses.'
                    },
                    {
                        locale: 'vi',
                        title: 'Đào Tạo Vận Hành',
                        description: 'Chương trình đào tạo vận hành xe nâng được chứng nhận. Khóa học đào tạo an toàn và vận hành toàn diện.',
                        shortDescription: 'Đào tạo vận hành xe nâng chuyên nghiệp',
                        metaTitle: 'Đào Tạo Vận Hành Xe Nâng | Chương Trình Được Chứng Nhận',
                        metaDescription: 'Được chứng nhận với chương trình đào tạo vận hành xe nâng chuyên nghiệp. Khóa học an toàn và vận hành toàn diện.',
                        metaKeywords: 'đào tạo xe nâng, chứng chỉ vận hành, đào tạo an toàn, đào tạo vận hành',
                        ogTitle: 'Đào Tạo Vận Hành Xe Nâng - Lấy Chứng Chỉ',
                        ogDescription: 'Chương trình đào tạo vận hành xe nâng chuyên nghiệp. Nhận chứng chỉ với khóa học an toàn và vận hành toàn diện.'
                    }
                ]
            }
        ];

        for (const service of services) {
            // Insert service and get the generated id
            const result = await queryRunner.query(
                `INSERT INTO "services" (icon, "order", is_active) VALUES ($1, $2, $3) RETURNING id`,
                [service.icon, service.order, true]
            );
            const serviceId = result[0].id;

            // Insert translations using the generated service id
            for (const translation of service.translations) {
                await queryRunner.query(
                    `INSERT INTO "service_translations" (
                        service_id, 
                        locale, 
                        title, 
                        description,
                        short_description,
                        meta_title,
                        meta_description,
                        meta_keywords,
                        og_title,
                        og_description
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                    [
                        serviceId,
                        translation.locale,
                        translation.title,
                        translation.description,
                        translation.shortDescription,
                        translation.metaTitle,
                        translation.metaDescription,
                        translation.metaKeywords,
                        translation.ogTitle,
                        translation.ogDescription
                    ]
                );
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`TRUNCATE TABLE "service_translations" CASCADE`);
        await queryRunner.query(`TRUNCATE TABLE "services" CASCADE`);
    }
} 