import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewsThemeSection1741659280413 implements MigrationInterface {
  name = 'AddNewsThemeSection1741659280413';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Lấy id của theme vừa tạo
    const themeResult = await queryRunner.query(`
      SELECT id FROM themes WHERE name = 'Default Theme' LIMIT 1
    `);
    const themeId = themeResult[0].id;

    // Thêm news section với cấu hình mặc định
    await queryRunner.query(`
      INSERT INTO theme_sections (theme_id, type, title, "order", settings)
      VALUES (
        ${themeId},
        'news',
        'Tin tức mới nhất',
        2,
        '{
          "layout": "grid",
          "columns": 3,
          "maxItems": 6,
          "showDate": true,
          "showAuthor": true,
          "showExcerpt": true,
          "excerptLength": 120,
          "imageAspectRatio": "16/9",
          "gap": "1rem",
          "backgroundGradient": {
            "from": "rgba(0,0,0,0.7)",
            "to": "rgba(0,0,0,0)",
            "direction": "to-t"
          },
          "overlayOpacity": "0.5",
          "padding": {
            "top": "2rem",
            "bottom": "2rem"
          },
          "buttonText": "Xem thêm",
          "buttonStyle": "primary"
        }'::jsonb
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa news section
    await queryRunner.query(`
      DELETE FROM theme_sections
      WHERE type = 'news'
    `);
  }
} 