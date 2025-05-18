import { MigrationInterface, QueryRunner } from 'typeorm';

export class MoveTicketPricingDataToTranslations1745000000032 implements MigrationInterface {
  name = 'MoveTicketPricingDataToTranslations1745000000032';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Lấy danh sách theme sections đã migrate từ ticket pricing
    const themeSections = await queryRunner.query(`
      SELECT id, settings 
      FROM theme_sections 
      WHERE type IN ('hero', 'pricing_table', 'benefits', 'faq', 'cta')
      AND page_type = 'ticket_pricing_page'
    `);

    console.log(`Found ${themeSections.length} ticket pricing sections to update translations`);

    // Với mỗi theme section, cập nhật settings vào bảng translations
    for (const section of themeSections) {
      // Lấy tất cả bản dịch cho section này
      const translations = await queryRunner.query(`
        SELECT id, settings
        FROM theme_section_translations
        WHERE section_id = $1
      `, [section.id]);

      console.log(`Found ${translations.length} translations for section ${section.id}`);

      // Với mỗi bản dịch, cập nhật settings từ section
      for (const translation of translations) {
        const currentSettings = translation.settings || {};
        const sectionSettings = section.settings || {};
        
        // Gộp settings từ cả hai nguồn
        const mergedSettings = {
          ...sectionSettings,
          ...currentSettings
        };

        // Cập nhật settings cho bản dịch
        await queryRunner.query(`
          UPDATE theme_section_translations
          SET settings = $1
          WHERE id = $2
        `, [JSON.stringify(mergedSettings), translation.id]);

        console.log(`Updated settings for translation ${translation.id}`);
      }

      // Xóa settings khỏi theme section sau khi đã di chuyển sang translations
      await queryRunner.query(`
        UPDATE theme_sections
        SET settings = '{}'
        WHERE id = $1
      `, [section.id]);

      console.log(`Cleared settings from section ${section.id}`);
    }

    console.log('Migration of ticket pricing settings to translations completed successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Lấy danh sách các theme sections là ticket pricing
    const themeSections = await queryRunner.query(`
      SELECT id 
      FROM theme_sections 
      WHERE type IN ('hero', 'pricing_table', 'benefits', 'faq', 'cta')
      AND page_type = 'ticket_pricing_page'
    `);

    console.log(`Found ${themeSections.length} ticket pricing sections to restore settings`);

    // Với mỗi section, lấy settings từ bản dịch en và khôi phục vào section
    for (const section of themeSections) {
      // Lấy bản dịch tiếng Anh (hoặc bản dịch đầu tiên nếu không có)
      const translation = await queryRunner.query(`
        SELECT settings
        FROM theme_section_translations
        WHERE section_id = $1
        AND locale = 'en'
        LIMIT 1
      `, [section.id]);

      if (translation && translation.length > 0) {
        // Khôi phục settings từ bản dịch vào section
        await queryRunner.query(`
          UPDATE theme_sections
          SET settings = $1
          WHERE id = $2
        `, [JSON.stringify(translation[0].settings || {}), section.id]);

        console.log(`Restored settings to section ${section.id} from translation`);
      }
    }

    console.log('Rollback of ticket pricing settings migration completed');
  }
} 