import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateNavbarHotlineToArray1743270380289 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Cập nhật cấu trúc dữ liệu cho hotline thành array
        await queryRunner.query(`
            UPDATE "theme_sections"
            SET "settings" = jsonb_set(
                "settings",
                '{phoneButton}',
                jsonb_build_object(
                    'text', 'Hotline',
                    'numbers', jsonb_build_array(
                        jsonb_build_object(
                            'label', 'Hotline',
                            'number', '0869.519.678',
                            'textColor', '#ffffff',
                            'backgroundColor', 'rgb(var(--color-primary-500))'
                        )
                    ),
                    'textColor', '#ffffff',
                    'backgroundColor', 'rgb(var(--color-primary-500))'
                )
            )
            WHERE "type" = 'simple_navbar';
        `);

        // Cập nhật cấu trúc dữ liệu cho booking button
        await queryRunner.query(`
            UPDATE "theme_sections"
            SET "settings" = jsonb_set(
                "settings",
                '{bookingButton}',
                jsonb_build_object(
                    'href', '/booking',
                    'text', 'Đặt vé ngay',
                    'textColor', '#ffffff',
                    'phoneNumbers', jsonb_build_array(
                        jsonb_build_object(
                            'label', 'Hotline',
                            'number', '0869.519.678'
                        )
                    ),
                    'backgroundColor', 'rgb(var(--color-primary-500))'
                )
            )
            WHERE "type" = 'simple_navbar';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Khôi phục lại cấu trúc dữ liệu cũ cho hotline
        await queryRunner.query(`
            UPDATE "theme_sections"
            SET "settings" = jsonb_set(
                "settings",
                '{phoneButton}',
                jsonb_build_object(
                    'text', 'Hotline',
                    'number', '0869.519.678',
                    'textColor', '#ffffff',
                    'backgroundColor', 'rgb(var(--color-primary-500))'
                )
            )
            WHERE "type" = 'simple_navbar';
        `);

        // Khôi phục lại cấu trúc dữ liệu cũ cho booking button
        await queryRunner.query(`
            UPDATE "theme_sections"
            SET "settings" = jsonb_set(
                "settings",
                '{bookingButton}',
                jsonb_build_object(
                    'href', '/booking',
                    'text', 'Đặt vé ngay',
                    'textColor', '#ffffff',
                    'phoneNumber', '0869.519.678',
                    'backgroundColor', 'rgb(var(--color-primary-500))'
                )
            )
            WHERE "type" = 'simple_navbar';
        `);
    }
} 