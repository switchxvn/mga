import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFooterLayout1742376012345 implements MigrationInterface {
    name = 'UpdateFooterLayout1742376012345'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Xóa toàn bộ dữ liệu cũ
        await queryRunner.query(`TRUNCATE TABLE "footers" RESTART IDENTITY CASCADE`);

        // Thêm dữ liệu mới
        const footerData = {
            name: 'Default Footer',
            type: 'main',
            content: {
                sections: [
                    {
                        title: 'TRỤ SỞ CHÍNH - VĂN PHÒNG',
                        subtitle: 'NHÀ MÁY LẮP RÁP SKD',
                        items: [
                            {
                                label: 'Đ/c: 37/6 Khu Phố Tây, Phường Vĩnh Phú, Thị Xã Thuận An, Tỉnh Bình Dương',
                                type: 'address'
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
                        title: 'CHI NHÁNH MIỀN BẮC - HÀ NỘI',
                        items: [
                            {
                                label: 'Đ/c: 989 Nguyễn Đức thuận, Trâu Quỳ, Gia Lâm, Hà Nội',
                                type: 'address'
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
                        title: null,
                        items: [
                            {
                                label: 'Đ/c: Lầu 7, số 60 Nguyễn Văn Thủ, Phường Da Kao, Quận 1, Thành phố Hồ Chí Minh',
                                type: 'address'
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
                        title: 'CHI NHÁNH TÂY NAM BỘ - CẦN THƠ',
                        items: [
                            {
                                label: 'Đ/c: A5-1, đường số 4, KDC Nam Long, Khu Vực 11, phường Hưng Thạnh, quận Cái Răng, TP. Cần Thơ',
                                type: 'address'
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
                ],
                companyInfo: {
                    logo: '/images/mga-forklift-logo.png',
                    name: 'MGA FORKLIFT',
                    registration: 'CÔNG TY CỔ PHẦN XE NÂNG MGA hoạt động theo GPKD 0301477050 do Sở Kế Hoạch Và Đầu Tư TP. Hồ Chí Minh cấp ngày 01 tháng 10 năm 1998',
                    bocongthuong: {
                        image: '/images/da-thong-bao-bo-cong-thuong.png',
                        text: 'Sử dụng dịch vụ tại Website này nghĩa là đã đồng ý với điều khoản sử dụng dịch vụ'
                    }
                },
                customerService: {
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
                socialMedia: {
                    facebook: {
                        pageUrl: 'https://www.facebook.com/mgaforklift',
                        embedCode: '<!-- Facebook embed code here -->'
                    },
                    map: {
                        embedUrl: 'https://www.google.com/maps/embed?pb=...'
                    }
                },
                copyright: '© 2024 MGA FORKLIFT. Tất cả các quyền được bảo lưu.',
                theme: {
                    backgroundColor: '#ffc107',
                    textColor: '#000000',
                    linkColor: '#ff0000'
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