import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFooterStructure1742380088990 implements MigrationInterface {
    name = 'UpdateFooterStructure1742380088990'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop existing columns
        await queryRunner.query(`
            ALTER TABLE "footers" 
            DROP COLUMN IF EXISTS "type",
            DROP COLUMN IF EXISTS "content",
            DROP COLUMN IF EXISTS "images",
            DROP COLUMN IF EXISTS "styles"
        `);

        // Add new columns
        await queryRunner.query(`
            ALTER TABLE "footers" 
            ADD COLUMN IF NOT EXISTS "addresses" jsonb NOT NULL DEFAULT '[]',
            ADD COLUMN IF NOT EXISTS "map_url" text,
            ADD COLUMN IF NOT EXISTS "fanpage_url" text,
            ADD COLUMN IF NOT EXISTS "company_info" jsonb NOT NULL DEFAULT '{}',
            ADD COLUMN IF NOT EXISTS "quick_links" jsonb NOT NULL DEFAULT '[]',
            ADD COLUMN IF NOT EXISTS "background_light_color" text NOT NULL DEFAULT '#ffc107',
            ADD COLUMN IF NOT EXISTS "background_dark_color" text NOT NULL DEFAULT '#111827',
            ADD COLUMN IF NOT EXISTS "copyright" text,
            ADD COLUMN IF NOT EXISTS "social_icons" jsonb NOT NULL DEFAULT '[]',
            ADD COLUMN IF NOT EXISTS "logo_url" text NOT NULL DEFAULT '',
            ADD COLUMN IF NOT EXISTS "logo_alt" text NOT NULL DEFAULT 'Company Logo'
        `);

        // Xóa dữ liệu cũ
        await queryRunner.query(`TRUNCATE TABLE "footers" RESTART IDENTITY CASCADE`);

        // Thêm dữ liệu mới
        const footerData = {
            name: 'Default Footer',
            addresses: JSON.stringify([
                {
                    title: 'Trụ sở chính',
                    subtitle: 'Văn phòng giao dịch',
                    location: '123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh',
                    phone: [
                        {
                            label: 'Hotline',
                            number: '1900 1234',
                            contact: '24/7'
                        },
                        {
                            label: 'Văn phòng',
                            number: '028 1234 5678'
                        }
                    ],
                    email: [
                        {
                            label: 'Hỗ trợ',
                            address: 'support@example.com',
                            contact: '24/7'
                        },
                        {
                            label: 'Kinh doanh',
                            address: 'sales@example.com'
                        }
                    ]
                }
            ]),
            mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.1234567890123!2d106.12345678901234!3d10.1234567890123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDA3JzM0LjQiTiAxMDbCsDA3JzM0LjQiRQ!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s',
            fanpageUrl: 'https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fexample&tabs=timeline&width=340&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId=123456789',
            companyInfo: JSON.stringify({
                name: 'Công ty TNHH Example',
                registration: 'Giấy phép kinh doanh số: 0123456789',
                tax_number: 'MST: 0123456789',
                business_license: 'Giấy phép hoạt động số: ABC-123',
                certifications: [
                    {
                        image: '/images/cert1.png',
                        alt: 'Chứng nhận ISO',
                        text: 'ISO 9001:2015'
                    },
                    {
                        image: '/images/cert2.png',
                        alt: 'Chứng nhận bảo mật',
                        text: 'PCI DSS'
                    }
                ]
            }),
            quickLinks: JSON.stringify([
                {
                    label: 'Về chúng tôi',
                    url: '/about',
                    icon: 'ph:info'
                },
                {
                    label: 'Sản phẩm',
                    url: '/products',
                    icon: 'ph:shopping-cart'
                },
                {
                    label: 'Dịch vụ',
                    url: '/services',
                    icon: 'ph:gear'
                },
                {
                    label: 'Tin tức',
                    url: '/news',
                    icon: 'ph:newspaper'
                },
                {
                    label: 'Liên hệ',
                    url: '/contact',
                    icon: 'ph:envelope'
                }
            ]),
            backgroundLightColor: '#ffc107',
            backgroundDarkColor: '#111827',
            copyright: '© 2024 Example Company. All rights reserved.',
            socialIcons: JSON.stringify([
                {
                    name: 'Facebook',
                    icon: 'ph:facebook-logo',
                    url: 'https://facebook.com/example'
                },
                {
                    name: 'Twitter',
                    icon: 'ph:twitter-logo',
                    url: 'https://twitter.com/example'
                },
                {
                    name: 'LinkedIn',
                    icon: 'ph:linkedin-logo',
                    url: 'https://linkedin.com/company/example'
                },
                {
                    name: 'YouTube',
                    icon: 'ph:youtube-logo',
                    url: 'https://youtube.com/c/example'
                }
            ]),
            logoUrl: '/images/logo.png',
            logoAlt: 'Example Company Logo',
            isActive: true
        };

        await queryRunner.query(
            `INSERT INTO "footers" (
                name, 
                addresses, 
                map_url, 
                fanpage_url, 
                company_info, 
                quick_links, 
                background_light_color, 
                background_dark_color, 
                copyright, 
                social_icons, 
                logo_url, 
                logo_alt, 
                is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [
                footerData.name,
                footerData.addresses,
                footerData.mapUrl,
                footerData.fanpageUrl,
                footerData.companyInfo,
                footerData.quickLinks,
                footerData.backgroundLightColor,
                footerData.backgroundDarkColor,
                footerData.copyright,
                footerData.socialIcons,
                footerData.logoUrl,
                footerData.logoAlt,
                footerData.isActive
            ]
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa dữ liệu
        await queryRunner.query(`TRUNCATE TABLE "footers" RESTART IDENTITY CASCADE`);
        
        // Xóa columns mới thêm
        await queryRunner.query(`
            ALTER TABLE "footers" 
            DROP COLUMN IF EXISTS "addresses",
            DROP COLUMN IF EXISTS "map_url",
            DROP COLUMN IF EXISTS "fanpage_url",
            DROP COLUMN IF EXISTS "company_info",
            DROP COLUMN IF EXISTS "quick_links",
            DROP COLUMN IF EXISTS "background_light_color",
            DROP COLUMN IF EXISTS "background_dark_color",
            DROP COLUMN IF EXISTS "copyright",
            DROP COLUMN IF EXISTS "social_icons",
            DROP COLUMN IF EXISTS "logo_url",
            DROP COLUMN IF EXISTS "logo_alt"
        `);

        // Thêm lại columns cũ
        await queryRunner.query(`
            ALTER TABLE "footers" 
            ADD COLUMN IF NOT EXISTS "type" text NOT NULL DEFAULT 'default',
            ADD COLUMN IF NOT EXISTS "content" jsonb NOT NULL DEFAULT '{}',
            ADD COLUMN IF NOT EXISTS "images" jsonb NOT NULL DEFAULT '[]',
            ADD COLUMN IF NOT EXISTS "styles" jsonb NOT NULL DEFAULT '{}'
        `);
    }
} 