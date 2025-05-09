import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTicketPrintLabelSettings1745000000014 implements MigrationInterface {
  name = 'FixTicketPrintLabelSettings1745000000014'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Thêm cài đặt cho nhãn vé in nhỏ
    await queryRunner.query(`
      INSERT INTO settings (key, value, "group", description, is_public)
      VALUES 
      ('ticket.print.label.title', 'VÉ THAM QUAN', 'ticket', 'Tiêu đề chính cho nhãn vé nhỏ', true),
      ('ticket.print.label.footer', 'Vui lòng giữ vé cẩn thận', 'ticket', 'Nội dung footer cho nhãn vé nhỏ', true),
      ('ticket.print.label.qrSize', '100', 'ticket', 'Kích thước mã QR cho nhãn vé nhỏ (px)', true),
      ('ticket.print.label.fontSize', '6', 'ticket', 'Kích thước font chữ cho nhãn vé nhỏ (pt)', true),
      ('ticket.print.label.padding', '3mm', 'ticket', 'Khoảng cách lề cho nhãn vé nhỏ', true),
      ('ticket.print.label.headerFontSize', '8', 'ticket', 'Kích thước font chữ tiêu đề cho nhãn vé nhỏ (pt)', true)
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
        'ticket.print.label.title',
        'ticket.print.label.footer',
        'ticket.print.label.qrSize',
        'ticket.print.label.fontSize',
        'ticket.print.label.padding',
        'ticket.print.label.headerFontSize'
      )
    `);
  }
} 