import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateTicketPricingSectionsToThemeSections1745000000029 implements MigrationInterface {
  name = 'MigrateTicketPricingSectionsToThemeSections1745000000029';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Lấy active theme ID
    const activeTheme = await queryRunner.query(`
      SELECT id FROM themes WHERE is_active = true LIMIT 1
    `);

    if (!activeTheme?.length) {
      throw new Error('No active theme found');
    }

    const themeId = activeTheme[0].id;

    // Lấy tất cả các ticket pricing sections
    const ticketPricingSections = await queryRunner.query(`
      SELECT * FROM ticket_pricing_sections
    `);

    console.log(`Found ${ticketPricingSections.length} ticket pricing sections to migrate`);

    // Với mỗi ticket pricing section, tạo một theme section mới
    for (const section of ticketPricingSections) {
      // Thêm theme section mới
      const result = await queryRunner.query(`
        INSERT INTO theme_sections (
          theme_id,
          type,
          component_name,
          "order",
          page_type,
          settings,
          is_active,
          created_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, 'ticket_pricing_page', $5, $6, $7, $8
        ) RETURNING id
      `, [
        themeId,
        section.type,
        section.component_name,
        section.order,
        section.settings,
        section.is_active,
        section.created_at,
        section.updated_at
      ]);

      const newSectionId = result[0].id;
      console.log(`Migrated ticket pricing section ${section.id} to theme section ${newSectionId}`);

      // Lấy tất cả các bản dịch cho section này
      const translations = await queryRunner.query(`
        SELECT * FROM ticket_pricing_section_translations
        WHERE section_id = $1
      `, [section.id]);

      console.log(`Found ${translations.length} translations for section ${section.id}`);

      // Với mỗi bản dịch, tạo bản dịch mới cho theme section
      for (const translation of translations) {
        // Tạo cấu trúc settings dựa trên dữ liệu của bản dịch
        const translationSettings = {
          ...translation.data
        };

        await queryRunner.query(`
          INSERT INTO theme_section_translations (
            section_id,
            locale,
            title,
            description,
            settings,
            created_at,
            updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7
          )
        `, [
          newSectionId,
          translation.locale,
          translation.title,
          translation.content,
          translationSettings,
          translation.created_at,
          translation.updated_at
        ]);

        console.log(`Migrated translation ${translation.id} for locale ${translation.locale}`);
      }
    }

    // Không xóa các bảng cũ ngay lập tức để phòng trường hợp cần rollback
    console.log('Migration of ticket pricing sections to theme sections completed successfully');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa tất cả các theme sections có type là các loại từ TicketPricingSectionType
    const ticketSectionTypes = ["'hero'", "'pricing_table'", "'benefits'", "'faq'", "'cta'"];
    
    // Lấy danh sách các theme section IDs cần xóa
    const themeSectionIds = await queryRunner.query(`
      SELECT id FROM theme_sections 
      WHERE type IN (${ticketSectionTypes.join(',')})
      AND page_type = 'ticket_pricing_page'
    `);

    // Xóa các bản dịch trước
    for (const section of themeSectionIds) {
      await queryRunner.query(`
        DELETE FROM theme_section_translations 
        WHERE section_id = $1
      `, [section.id]);
    }

    // Xóa các theme sections
    await queryRunner.query(`
      DELETE FROM theme_sections 
      WHERE type IN (${ticketSectionTypes.join(',')})
      AND page_type = 'ticket_pricing_page'
    `);

    console.log('Rollback of ticket pricing sections migration completed');
  }
} 