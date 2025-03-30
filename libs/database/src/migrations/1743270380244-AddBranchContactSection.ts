import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBranchContactSection1743270380244 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get active theme id
    const activeTheme = await queryRunner.query(`
      SELECT id FROM themes WHERE is_active = true LIMIT 1
    `);
    
    const themeId = activeTheme[0]?.id || 1;

    await queryRunner.query(`
      INSERT INTO theme_sections (
        theme_id,
        type,
        component_name,
        title,
        "order",
        page_type,
        settings,
        is_active
      ) VALUES (
        ${themeId},
        'branch_contact',
        'BranchContactSection',
        'Liên hệ công ty MGA Việt Nam',
        100,
        'common',
        '{
          "branches": [
            {
              "name": "TRỤ SỞ CHÍNH - VĂN PHÒNG",
              "address": "Lầu 7, số 60 Nguyễn Văn Thủ, Phường Da Kao, Quận 1, Thành phố Hồ Chí Minh",
              "contacts": [
                {
                  "label": "Hotline (Mr Thông)",
                  "value": "0917 001 254",
                  "type": "phone"
                },
                {
                  "label": "Email",
                  "value": "thong@mgavietnam.com",
                  "type": "email"
                }
              ]
            },
            {
              "name": "CHI NHÁNH MIỀN BẮC - HÀ NỘI",
              "address": "1039-1041 Kiên Trung, Trâu Quỳ, Gia Lâm, Hà Nội",
              "contacts": [
                {
                  "label": "Hotline (Mr Đạo)",
                  "value": "0917 004 628",
                  "type": "phone"
                },
                {
                  "label": "Hotline (Mr Hùng)",
                  "value": "0945 533 840",
                  "type": "phone"
                },
                {
                  "label": "Email",
                  "value": "dao@mgavietnam.com",
                  "type": "email"
                },
                {
                  "label": "Email",
                  "value": "ngvhung@mgavietnam.com",
                  "type": "email"
                }
              ]
            },
            {
              "name": "NHÀ MÁY LẮP RÁP SKD",
              "address": "37/6 khu Phố Tây, Phường Vĩnh Phú, Thị Xã Thuận An, Tỉnh Bình Dương",
              "contacts": [
                {
                  "label": "Hotline (Mr Thông)",
                  "value": "0917 001 254",
                  "type": "phone"
                },
                {
                  "label": "Fax",
                  "value": "0274.6547200",
                  "type": "phone"
                },
                {
                  "label": "Email",
                  "value": "thong@mgavietnam.com",
                  "type": "email"
                }
              ]
            },
            {
              "name": "CHI NHÁNH MIỀN NAM - BÌNH DƯƠNG",
              "address": "1/1B Khu phố Hòa Long, Phường Lái Thiêu, Thị xã Thuận An, Tỉnh Bình Dương",
              "contacts": [
                {
                  "label": "Email",
                  "value": "admin@mgavietnam.com",
                  "type": "email"
                }
              ]
            },
            
            {
              "name": "CHI NHÁNH TÂY NAM BỘ - CẦN THƠ",
              "address": "81, tổ 61, khu vực 11 - Phường Hưng Phú - Quận Cái Răng - Cần Thơ",
              "contacts": [
                {
                  "label": "Hotline (Mr Công)",
                  "value": "0917 001 733",
                  "type": "phone"
                },
                {
                  "label": "Email",
                  "value": "congtm@mgavietnam.com",
                  "type": "email"
                }
              ]
            }
          ],
          "styles": {
            "backgroundColor": "bg-white dark:bg-gray-900",
            "textColor": "text-gray-900 dark:text-gray-100",
            "branchNameColor": "text-primary-600 dark:text-primary-400",
            "addressColor": "text-gray-700 dark:text-gray-300",
            "contactLabelColor": "text-gray-600 dark:text-gray-400",
            "contactValueColor": "text-gray-900 dark:text-gray-100",
            "dividerColor": "border-gray-200 dark:border-gray-700",
            "spacing": {
              "container": "py-12 px-4 sm:px-6 lg:px-8",
              "grid": "gap-8 lg:gap-12",
              "branch": "space-y-4"
            }
          }
        }',
        true
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM theme_sections 
      WHERE type = 'branch_contact' 
      AND component_name = 'BranchContactSection'
    `);
  }
}