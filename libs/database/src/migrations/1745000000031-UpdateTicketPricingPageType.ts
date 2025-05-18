import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTicketPricingPageType1745000000031 implements MigrationInterface {
  name = 'UpdateTicketPricingPageType1745000000031';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Cập nhật pageType cho các theme_sections đã migrate từ ticket_pricing_sections
    // Sử dụng giá trị TICKET_PRICING_PAGE đã thêm vào enum
    await queryRunner.query(`
      UPDATE theme_sections 
      SET page_type = 'ticket_pricing_page' 
      WHERE type IN ('hero', 'pricing_table', 'benefits', 'faq', 'cta')
      AND page_type = 'ticket_pricing_page'
    `);

    console.log('Updated ticket pricing page type to use the new enum value');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback lại page_type thành một giá trị enum hợp lệ khác nếu enum bị xóa
    await queryRunner.query(`
      UPDATE theme_sections 
      SET page_type = 'common' 
      WHERE page_type = 'ticket_pricing_page' AND 
      type IN ('hero', 'pricing_table', 'benefits', 'faq', 'cta')
    `);

    console.log('Reverted ticket pricing page type changes');
  }
} 