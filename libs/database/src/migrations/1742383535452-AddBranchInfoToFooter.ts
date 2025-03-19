import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBranchInfoToFooter1742383535452 implements MigrationInterface {
    name = 'AddBranchInfoToFooter1742383535452'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add branch_info column
        await queryRunner.query(`ALTER TABLE "footers" ADD COLUMN IF NOT EXISTS "branch_info" jsonb`);

        // Update data for active footer
        const branchInfoData = [
            {
                title: "CHI NHÁNH Miền BẮC - HÀ NỘI",
                address: "989 Nguyễn Đức thuận, Trâu Quỳ, Gia Lâm, Hà Nội",
                contacts: [
                    {
                        name: "Mr Đạo",
                        phone: "0917 004 628",
                        email: "dao@mgavietnam.com"
                    },
                    {
                        name: "Mr Hùng",
                        position: "chuyên viên xe nâng",
                        phone: "094 55 33 840",
                        email: "ngvhung@mgavietnam.com"
                    },
                    {
                        name: "Ms. Hoàng Nhâm",
                        position: "chuyên viên xe nâng",
                        phone: "0917 001 728",
                        email: "hoangnham@mgavietnam.com"
                    }
                ]
            },
            {
                title: "VĂN PHÒNG ĐẠI DIỆN TP.HCM",
                address: "Lầu 7, số 60 Nguyễn Văn Thủ, Phường Đa Kao, Quận 1, Thành phố Hồ Chí Minh",
                contacts: [
                    {
                        name: "Mr Thông",
                        phone: "0917 001 254",
                        email: "thong@mgavietnam.com"
                    }
                ]
            },
            {
                title: "CHI NHÁNH TÂY NAM BỘ - CẦN THƠ",
                address: "A5-1, đường số 4, KDC Nam Long, Khu Vực 11, phường Hưng Thạnh, quận Cái Răng, TP. Cần Thơ",
                contacts: [
                    {
                        name: "Mr Công",
                        phone: "0917 001 733",
                        email: "congtm@mgavietnam.com"
                    }
                ]
            },
            {
                title: "DỊCH VỤ KHÁCH HÀNG",
                address: "",
                contacts: [
                    {
                        position: "Than phiền dịch vụ",
                        phone: "0918 865 060",
                        email: "support@mgavietnam.com"
                    }
                ]
            }
        ];

        await queryRunner.query(`
            UPDATE "footers"
            SET "branch_info" = $1::jsonb
            WHERE "is_active" = true
        `, [JSON.stringify(branchInfoData)]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove branch_info column
        await queryRunner.query(`ALTER TABLE "footers" DROP COLUMN IF EXISTS "branch_info"`);
    }
} 