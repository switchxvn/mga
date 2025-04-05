import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTicketBookingSection1743270380250 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if theme exists
    const theme = await queryRunner.query(`
      SELECT id FROM themes WHERE id = 1;
    `);

    // Create theme if it doesn't exist
    if (!theme || theme.length === 0) {
      await queryRunner.query(`
        INSERT INTO themes (id, name, is_active)
        VALUES (1, 'Default Theme', true);
      `);
    }

    // Add ticket booking section
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
        1,
        'ticket_booking',
        'TicketBookingSection',
        'Đặt vé cáp treo',
        1,
        'home_page',
        '{
          "layout": "floating-card",
          "backgroundColor": "bg-white dark:bg-gray-800",
          "cardBackgroundColor": "bg-white dark:bg-gray-900",
          "cardShadow": "shadow-xl",
          "borderRadius": "rounded-xl",
          "padding": "p-6",
          "width": "max-w-3xl",
          "position": "relative -mt-20",
          "zIndex": "z-10",
          "margin": "mx-auto",
          "tabs": [
            {
              "id": "cable_car",
              "label": "Vé cáp treo khứ hồi",
              "price": 500000,
              "description": "Vé cáp treo khứ hồi dành cho người lớn"
            },
            {
              "id": "cable_car_buffet",
              "label": "Vé cáp treo + Buffet",
              "price": 800000,
              "description": "Vé cáp treo khứ hồi kèm buffet trưa"
            }
          ],
          "form": {
            "datePickerLabel": "Ngày tham quan",
            "guestsLabel": "Số khách",
            "minGuests": 1,
            "maxGuests": 10,
            "buttonText": "Đặt vé ngay",
            "buttonColor": "bg-primary-600 hover:bg-primary-700",
            "buttonTextColor": "text-white"
          },
          "colors": {
            "primary": "text-primary-600 dark:text-primary-400",
            "secondary": "text-gray-600 dark:text-gray-400",
            "heading": "text-gray-900 dark:text-white"
          },
          "typography": {
            "heading": "text-2xl font-bold",
            "tabLabel": "text-base font-medium",
            "price": "text-lg font-semibold",
            "description": "text-sm"
          }
        }'::jsonb,
        true
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM theme_sections
      WHERE type = 'ticket_booking'
      AND component_name = 'TicketBookingSection';
    `);
  }
} 