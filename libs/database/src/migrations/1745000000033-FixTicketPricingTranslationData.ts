import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixTicketPricingTranslationData1745000000033 implements MigrationInterface {
  name = 'FixTicketPricingTranslationData1745000000033';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Lấy tất cả bản dịch của ticket pricing sections để chuyển từ data -> settings
    const translations = await queryRunner.query(`
      SELECT tst.id, tst.settings, tst.description, ts.type
      FROM theme_section_translations tst
      JOIN theme_sections ts ON tst.section_id = ts.id
      WHERE ts.type IN ('hero', 'pricing_table', 'benefits', 'faq', 'cta')
      AND ts.page_type = 'ticket_pricing_page'
    `);

    console.log(`Found ${translations.length} ticket pricing translations to update data format`);

    // Chuyển dữ liệu cho mỗi loại section
    for (const translation of translations) {
      const currentSettings = translation.settings || {};
      
      // Tùy thuộc vào loại section, tạo cấu trúc settings phù hợp
      let updatedSettings = { ...currentSettings };
      
      // Đối với pricing_table, thêm dữ liệu từ field tiers
      if (translation.type === 'pricing_table' && currentSettings.tiers) {
        updatedSettings = {
          ...updatedSettings,
          tiers: currentSettings.tiers || []
        };
      }
      
      // Đối với benefits, thêm dữ liệu danh sách benefits
      if (translation.type === 'benefits' && currentSettings.benefits) {
        updatedSettings = {
          ...updatedSettings,
          benefits: currentSettings.benefits || []
        };
      }
      
      // Đối với faq, thêm dữ liệu câu hỏi và trả lời
      if (translation.type === 'faq' && currentSettings.faqs) {
        updatedSettings = {
          ...updatedSettings,
          faqs: currentSettings.faqs || []
        };
      }

      // Nếu có trường description, di chuyển content -> description
      if (translation.description) {
        updatedSettings.content = translation.description;
      }

      // Cập nhật settings cho bản dịch
      await queryRunner.query(`
        UPDATE theme_section_translations
        SET settings = $1
        WHERE id = $2
      `, [JSON.stringify(updatedSettings), translation.id]);

      console.log(`Updated data format for translation ${translation.id}`);
    }

    console.log('Migration to fix ticket pricing translation data completed successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Không cần rollback vì đây chỉ là chuyển đổi định dạng dữ liệu
    console.log('No rollback needed for this migration');
  }
} 