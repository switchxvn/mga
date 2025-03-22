import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCombinedNavbarHotlineColors1742637124944 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const settings = {
            slogan: {
                text: 'XE NÂNG MGA FORKLIFT LẮP RÁP SKD TẠI VIỆT NAM',
                subText: 'ĐỘNG CƠ ISUZU NHẬP KHẨU NỘI ĐỊA TỪ NHẬT BẢN',
                fontSize: 'lg',
                fontWeight: 'bold',
            },
            darkMode: {
                textColor: '#ffffff',
                borderColor: '#404040',
                menuBackgroundColor: '#171717',
                headerBackgroundColor: '#171717',
            },
            hotlines: {
                sales: {
                    text: 'Mua hàng',
                    number: '0917 00 1254',
                    textColor: '#ffffff',
                    backgroundColor: 'var(--tertiary-500)',
                },
                support: {
                    text: 'Dịch vụ khách hàng',
                    number: '0918 865 060',
                    textColor: '#ffffff',
                    backgroundColor: 'var(--tertiary-500)',
                },
            },
            showCart: true,
            textColor: '#000000',
            navigation: {
                textColor: 'var(--tertiary-500)',
                fontWeight: 'medium',
                activeTextColor: 'var(--primary-500)',
            },
            borderColor: '#e5e7eb',
            menuAlignment: 'center',
            showThemeToggle: true,
            menuBackgroundColor: '#ffffff',
            showLanguageSwitcher: true,
            headerBackgroundColor: '#feb912',
        };

        await queryRunner.query(
            `UPDATE theme_sections 
             SET settings = $1::jsonb
             WHERE type = 'combined_navbar'`,
            [settings],
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const previousSettings = {
            slogan: {
                text: 'XE NÂNG MGA FORKLIFT LẮP RÁP SKD TẠI VIỆT NAM',
                subText: 'ĐỘNG CƠ ISUZU NHẬP KHẨU NỘI ĐỊA TỪ NHẬT BẢN',
                fontSize: 'lg',
                fontWeight: 'bold',
            },
            darkMode: {
                textColor: '#ffffff',
                borderColor: '#404040',
                menuBackgroundColor: '#171717',
                headerBackgroundColor: '#171717',
            },
            hotlines: {
                sales: {
                    text: 'Mua hàng',
                    number: '0917 00 1254',
                    textColor: '#ffffff',
                    backgroundColor: '#0EA5E9',
                },
                support: {
                    text: 'Dịch vụ khách hàng',
                    number: '0918 865 060',
                    textColor: '#ffffff',
                    backgroundColor: '#0EA5E9',
                },
            },
            showCart: true,
            textColor: '#000000',
            navigation: {
                textColor: 'var(--tertiary-500)',
                fontWeight: 'medium',
                activeTextColor: 'var(--primary-500)',
            },
            borderColor: '#e5e7eb',
            menuAlignment: 'center',
            showThemeToggle: true,
            menuBackgroundColor: '#ffffff',
            showLanguageSwitcher: true,
            headerBackgroundColor: '#feb912',
        };

        await queryRunner.query(
            `UPDATE theme_sections 
             SET settings = $1::jsonb
             WHERE type = 'combined_navbar'`,
            [previousSettings],
        );
    }

}
