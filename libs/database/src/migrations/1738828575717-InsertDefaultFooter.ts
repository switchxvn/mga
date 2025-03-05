import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertDefaultFooter1738828575717 implements MigrationInterface {
    name = 'InsertDefaultFooter1738828575717'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert default footer
        await queryRunner.query(`
            INSERT INTO "footers" (
                "name", 
                "type", 
                "content", 
                "is_active", 
                "created_at", 
                "updated_at"
            ) VALUES (
                'Default Footer', 
                'simple', 
                '{"sections": [
                    {
                        "type": "links",
                        "title": "Liên kết nhanh",
                        "items": [
                            {"label": "Trang chủ", "url": "/"},
                            {"label": "Giới thiệu", "url": "/about"},
                            {"label": "Dịch vụ", "url": "/services"},
                            {"label": "Liên hệ", "url": "/contact"}
                        ]
                    },
                    {
                        "type": "links",
                        "title": "Hỗ trợ",
                        "items": [
                            {"label": "FAQ", "url": "/faq"},
                            {"label": "Chính sách bảo mật", "url": "/privacy-policy"},
                            {"label": "Điều khoản sử dụng", "url": "/terms-of-service"}
                        ]
                    }
                ],
                "copyright": "© 2024 Công ty của bạn. Tất cả các quyền được bảo lưu.",
                "theme": {
                    "backgroundColor": "#f8f9fa",
                    "textColor": "#212529"
                }}', 
                TRUE, 
                NOW(), 
                NOW()
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the default footer
        await queryRunner.query(`DELETE FROM "footers" WHERE "name" = 'Default Footer'`);
    }
} 