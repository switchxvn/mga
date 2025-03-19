import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFooterAndSeedData1742375788745 implements MigrationInterface {
    name = 'UpdateFooterAndSeedData1742375788745'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Xóa toàn bộ dữ liệu cũ
        await queryRunner.query(`TRUNCATE TABLE "footers" RESTART IDENTITY CASCADE`);

        // Thêm dữ liệu mới
        const footerData = {
            name: 'Default Footer',
            type: 'main',
            content: {
                linksSection: {
                    items: [
                        {
                            label: 'TRỤ SỞ CHÍNH - VĂN PHÒNG',
                            items: [
                                {
                                    label: 'Đ/c: 37/6 Khu Phố Tây, Phường Vĩnh Phú, Thị Xã Thuận An, Tỉnh Bình Dương',
                                    type: 'text'
                                },
                                {
                                    label: 'Hotline (Mr Thông): 0917 001 254',
                                    type: 'phone',
                                    url: 'tel:0917001254'
                                },
                                {
                                    label: 'Email: thong@mgavietnam.com',
                                    type: 'email',
                                    url: 'mailto:thong@mgavietnam.com'
                                }
                            ]
                        },
                        {
                            label: 'CHI NHÁNH MIỀN BẮC - HÀ NỘI',
                            items: [
                                {
                                    label: 'Đ/c: 989 Nguyễn Đức thuận, Trâu Quỳ, Gia Lâm, Hà Nội',
                                    type: 'text'
                                },
                                {
                                    label: 'Hotline (Mr Đạo): 0917 004 628',
                                    type: 'phone',
                                    url: 'tel:0917004628'
                                },
                                {
                                    label: 'Email: dao@mgavietnam.com',
                                    type: 'email',
                                    url: 'mailto:dao@mgavietnam.com'
                                },
                                {
                                    label: '(Mr Hưng - chuyên viên xe nâng)',
                                    type: 'text'
                                },
                                {
                                    label: 'Hotline: 094 55 33 840',
                                    type: 'phone',
                                    url: 'tel:0945533840'
                                },
                                {
                                    label: 'Email: ngvhung@mgavietnam.com',
                                    type: 'email',
                                    url: 'mailto:ngvhung@mgavietnam.com'
                                },
                                {
                                    label: '(Ms. Hoàng Nhâm - chuyên viên xe nâng)',
                                    type: 'text'
                                },
                                {
                                    label: 'Hotline: 0917 001 728',
                                    type: 'phone',
                                    url: 'tel:0917001728'
                                },
                                {
                                    label: 'Email: hoangnham@mgavietnam.com',
                                    type: 'email',
                                    url: 'mailto:hoangnham@mgavietnam.com'
                                }
                            ]
                        },
                        {
                            label: 'CHI NHÁNH TÂY NAM BỘ - CẦN THƠ',
                            items: [
                                {
                                    label: 'Đ/c: A5-1, đường số 4, KDC Nam Long, Khu Vực 11, phường Hưng Thạnh, quận Cái Răng, TP. Cần Thơ',
                                    type: 'text'
                                },
                                {
                                    label: 'Hotline (Mr Công): 0917 001 733',
                                    type: 'phone',
                                    url: 'tel:0917001733'
                                },
                                {
                                    label: 'Email: congtm@mgavietnam.com',
                                    type: 'email',
                                    url: 'mailto:congtm@mgavietnam.com'
                                }
                            ]
                        }
                    ]
                },
                contactSection: {
                    title: 'DỊCH VỤ KHÁCH HÀNG',
                    items: [
                        {
                            label: 'Than phiền dịch vụ: 0918 865 060',
                            type: 'phone',
                            url: 'tel:0918865060'
                        },
                        {
                            label: 'Email: support@mgavietnam.com',
                            type: 'email',
                            url: 'mailto:support@mgavietnam.com'
                        }
                    ]
                },
                copyright: '© 2024 MGA FORKLIFT. Tất cả các quyền được bảo lưu.',
                theme: {
                    backgroundColor: '#ffc107',
                    textColor: '#000000'
                }
            },
            isActive: true
        };

        await queryRunner.query(
            `INSERT INTO "footers" (name, type, content, is_active) VALUES ($1, $2, $3, $4)`,
            [footerData.name, footerData.type, footerData.content, footerData.isActive]
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa dữ liệu đã thêm
        await queryRunner.query(`TRUNCATE TABLE "footers" RESTART IDENTITY CASCADE`);
    }
} 