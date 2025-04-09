import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTicketBookingSectionWithNewSettings1743270380269 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Cập nhật các section có type là 'ticket_booking' với settings mới
        await queryRunner.query(`
            UPDATE theme_sections
            SET settings = jsonb_set(
                settings,
                '{form}',
                '{"maxGuests": 10, "minGuests": 1, "buttonText": "Đặt vé ngay", "buttonColor": "bg-primary-600 hover:bg-primary-700", "guestsLabel": "Số khách", "buttonTextColor": "text-white", "datePickerLabel": "Ngày tham quan"}'
            )
            WHERE type = 'ticket_booking';
        `);

        // Cập nhật các section có type là 'ticket_booking' với settings mới cho tabs
        await queryRunner.query(`
            UPDATE theme_sections
            SET settings = jsonb_set(
                settings,
                '{tabs}',
                'null'
            )
            WHERE type = 'ticket_booking';
        `);

        // Cập nhật các section có type là 'ticket_booking' với settings mới cho width
        await queryRunner.query(`
            UPDATE theme_sections
            SET settings = jsonb_set(
                settings,
                '{width}',
                '"max-w-3xl"'
            )
            WHERE type = 'ticket_booking';
        `);

        // Cập nhật các section có type là 'ticket_booking' với settings mới cho colors
        await queryRunner.query(`
            UPDATE theme_sections
            SET settings = jsonb_set(
                settings,
                '{colors}',
                '{"heading": "text-gray-900 dark:text-white", "primary": "text-primary-600 dark:text-primary-400", "secondary": "text-gray-600 dark:text-gray-400"}'
            )
            WHERE type = 'ticket_booking';
        `);

        // Cập nhật các section có type là 'ticket_booking' với settings mới cho layout
        await queryRunner.query(`
            UPDATE theme_sections
            SET settings = jsonb_set(
                settings,
                '{layout}',
                '"floating-card"'
            )
            WHERE type = 'ticket_booking';
        `);

        // Cập nhật các section có type là 'ticket_booking' với settings mới cho margin
        await queryRunner.query(`
            UPDATE theme_sections
            SET settings = jsonb_set(
                settings,
                '{margin}',
                '"mx-auto"'
            )
            WHERE type = 'ticket_booking';
        `);

        // Cập nhật các section có type là 'ticket_booking' với settings mới cho zIndex
        await queryRunner.query(`
            UPDATE theme_sections
            SET settings = jsonb_set(
                settings,
                '{zIndex}',
                '"z-10"'
            )
            WHERE type = 'ticket_booking';
        `);

        // Cập nhật các section có type là 'ticket_booking' với settings mới cho padding
        await queryRunner.query(`
            UPDATE theme_sections
            SET settings = jsonb_set(
                settings,
                '{padding}',
                '"p-6"'
            )
            WHERE type = 'ticket_booking';
        `);

        // Cập nhật các section có type là 'ticket_booking' với settings mới cho product
        await queryRunner.query(`
            UPDATE theme_sections
            SET settings = jsonb_set(
                settings,
                '{product}',
                '{"id": null, "price": 0, "title": "", "thumbnail": "", "description": ""}'
            )
            WHERE type = 'ticket_booking';
        `);

        // Cập nhật các section có type là 'ticket_booking' với settings mới cho position
        await queryRunner.query(`
            UPDATE theme_sections
            SET settings = jsonb_set(
                settings,
                '{position}',
                '"relative -mt-20"'
            )
            WHERE type = 'ticket_booking';
        `);

        // Cập nhật các section có type là 'ticket_booking' với settings mới cho variants
        await queryRunner.query(`
            UPDATE theme_sections
            SET settings = jsonb_set(
                settings,
                '{variants}',
                '[]'
            )
            WHERE type = 'ticket_booking';
        `);

        // Cập nhật các section có type là 'ticket_booking' với settings mới cho cardShadow
        await queryRunner.query(`
            UPDATE theme_sections
            SET settings = jsonb_set(
                settings,
                '{cardShadow}',
                '"shadow-xl"'
            )
            WHERE type = 'ticket_booking';
        `);

        // Cập nhật các section có type là 'ticket_booking' với settings mới cho typography
        await queryRunner.query(`
            UPDATE theme_sections
            SET settings = jsonb_set(
                settings,
                '{typography}',
                '{"price": "text-lg font-semibold", "heading": "text-2xl font-bold", "tabLabel": "text-base font-medium", "description": "text-sm"}'
            )
            WHERE type = 'ticket_booking';
        `);

        // Cập nhật các section có type là 'ticket_booking' với settings mới cho borderRadius
        await queryRunner.query(`
            UPDATE theme_sections
            SET settings = jsonb_set(
                settings,
                '{borderRadius}',
                '"rounded-xl"'
            )
            WHERE type = 'ticket_booking';
        `);

        // Cập nhật các section có type là 'ticket_booking' với settings mới cho backgroundColor
        await queryRunner.query(`
            UPDATE theme_sections
            SET settings = jsonb_set(
                settings,
                '{backgroundColor}',
                '"bg-white dark:bg-gray-800"'
            )
            WHERE type = 'ticket_booking';
        `);

        // Cập nhật các section có type là 'ticket_booking' với settings mới cho cardBackgroundColor
        await queryRunner.query(`
            UPDATE theme_sections
            SET settings = jsonb_set(
                settings,
                '{cardBackgroundColor}',
                '"bg-white dark:bg-gray-900"'
            )
            WHERE type = 'ticket_booking';
        `);

        // Thêm thông tin mới về miễn phí vé và xe điện
        await queryRunner.query(`
            UPDATE theme_sections
            SET settings = jsonb_set(
                settings,
                '{benefits}',
                '{"freeTicket": "Miễn phí vé cho trẻ dưới 1.2m và người già trên 70 tuổi", "freeShuttle": "Miễn phí xe điện đưa rước ra vào nhà ga cáp treo"}'
            )
            WHERE type = 'ticket_booking';
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa thông tin mới về miễn phí vé và xe điện
        await queryRunner.query(`
            UPDATE theme_sections
            SET settings = settings - 'benefits'
            WHERE type = 'ticket_booking';
        `);
    }
} 