import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTicketPricingData1743270380288 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update ticket pricing section data
        await queryRunner.query(`
            UPDATE "ticket_pricing_sections"
            SET "settings" = '{
                "backgroundColor": "bg-gray-50 dark:bg-gray-900",
                "typography": {
                    "heading": "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-center tracking-tight",
                    "subheading": "text-lg sm:text-xl md:text-2xl text-center max-w-2xl mx-auto font-medium",
                    "tierName": "text-xl font-semibold",
                    "price": "text-4xl font-bold",
                    "feature": "text-base"
                },
                "colors": {
                    "heading": "text-primary-600 dark:text-primary-400",
                    "subheading": "text-gray-600 dark:text-gray-400",
                    "tierName": "text-gray-900 dark:text-gray-100",
                    "price": "text-gray-900 dark:text-gray-100",
                    "feature": "text-gray-600 dark:text-gray-400",
                    "primary": "text-primary-600 dark:text-primary-400"
                }
            }'::jsonb
            WHERE "type" = 'pricing_table' AND "component_name" = 'TicketPricingTableSection';
        `);

        // Update translations for ticket pricing section
        await queryRunner.query(`
            UPDATE "ticket_pricing_section_translations"
            SET 
                "title" = 'Bảng Giá Vé & Dịch Vụ',
                "subtitle" = 'Thông tin chi tiết về giá vé và các dịch vụ tại điểm đến của chúng tôi',
                "data" = '{
                    "tiers": [
                        {
                            "id": 1,
                            "name": "Vé Cáp Treo 2 Chiều",
                            "price": 150000,
                            "currency": "₫",
                            "interval": "người lớn",
                            "features": [
                                "150,000 đ/người lớn",
                                "70,000 đ/trẻ em (trẻ từ 1.2m trở lên)",
                                "Miễn phí vé cho trẻ dưới 1.2m và người già trên 70 tuổi",
                                "Miễn phí xe điện đưa rước ra vào nhà ga cáp treo"
                            ],
                            "isPopular": true
                        },
                        {
                            "id": 2,
                            "name": "Giường Nghỉ Qua Đêm",
                            "price": 99000,
                            "currency": "₫",
                            "interval": "giường/đêm",
                            "features": [
                                "99,000 đ/giường mỗi đêm",
                                "Đầy đủ tiện nghi cơ bản",
                                "Vệ sinh phòng hàng ngày",
                                "WiFi miễn phí"
                            ]
                        },
                        {
                            "id": 3,
                            "name": "Dịch Vụ Gửi Xe",
                            "price": 10000,
                            "currency": "₫",
                            "interval": "xe máy",
                            "features": [
                                "Xe máy: 10,000 đ",
                                "Xe ô tô dưới 16 chỗ: 50,000 đ",
                                "Xe 29 chỗ: 80,000 đ",
                                "Xe 45 chỗ: 100,000 đ"
                            ]
                        },
                        {
                            "id": 4,
                            "name": "Ẩm Thực",
                            "price": 40000,
                            "currency": "₫",
                            "interval": "món",
                            "features": [
                                "Bánh canh: 40,000 đ/tô",
                                "Cơm sườn: 40,000 đ/tô",
                                "Café đá: 20,000 đ",
                                "Cà phê sữa: 25,000 đ",
                                "Nước suối: 10,000 đ",
                                "Nước giải khát: từ 15,000 đ đến 25,000 đ"
                            ]
                        }
                    ]
                }'::jsonb
            WHERE "section_id" IN (
                SELECT id FROM "ticket_pricing_sections" 
                WHERE "type" = 'pricing_table' AND "component_name" = 'TicketPricingTableSection'
            )
            AND "locale" = 'vi';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Không cần rollback vì đây là cập nhật dữ liệu
    }
} 