import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTicketPrintSettings1745000000013 implements MigrationInterface {
  name = 'AddTicketPrintSettings1745000000013'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Thêm cài đặt cho header của vé
    await queryRunner.query(`
      INSERT INTO settings (key, value, "group", description, is_public)
      VALUES 
      ('ticket.print.title', 'VÉ THAM QUAN', 'ticket', 'Tiêu đề chính trên vé', true),
      ('ticket.print.subtitle', 'Vé cáp treo 2 chiều', 'ticket', 'Tiêu đề phụ trên vé', true),
      ('ticket.print.location', 'KDL Cáp Treo', 'ticket', 'Địa điểm trên vé', true),
      ('ticket.print.footer', 'Vui lòng giữ vé cẩn thận và trình cho nhân viên khi vào cổng', 'ticket', 'Nội dung footer của vé', true),
      ('ticket.print.logo', 'https://example.com/logo.png', 'ticket', 'Logo trên vé', true),
      ('ticket.print.qrSize', '250', 'ticket', 'Kích thước mã QR trên vé (px)', true),
      ('ticket.print.backgroundColor', '#ffffff', 'ticket', 'Màu nền của vé', true),
      ('ticket.print.textColor', '#000000', 'ticket', 'Màu chữ của vé', true),
      ('ticket.print.borderColor', '#cccccc', 'ticket', 'Màu viền của vé', true)
    ON CONFLICT (key) DO UPDATE 
    SET value = EXCLUDED.value,
        description = EXCLUDED.description,
        is_public = EXCLUDED.is_public;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa các cài đặt đã thêm
    await queryRunner.query(`
      DELETE FROM settings 
      WHERE key IN (
        'ticket.print.title',
        'ticket.print.subtitle',
        'ticket.print.location',
        'ticket.print.footer',
        'ticket.print.logo',
        'ticket.print.qrSize',
        'ticket.print.backgroundColor',
        'ticket.print.textColor',
        'ticket.print.borderColor'
      )
    `);
  }
} 