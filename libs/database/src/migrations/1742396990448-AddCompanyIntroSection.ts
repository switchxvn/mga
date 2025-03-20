import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyIntroSection1742396990448 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get active theme id
    const activeTheme = await queryRunner.query(`
      SELECT id FROM themes WHERE is_active = true LIMIT 1
    `);

    if (!activeTheme || activeTheme.length === 0) {
      throw new Error('No active theme found');
    }

    const themeId = activeTheme[0].id;

    // Insert company intro section
    await queryRunner.query(`
      INSERT INTO theme_sections (theme_id, type, title, "order", settings, is_active, created_at, updated_at)
      VALUES (
        ${themeId},
        'company_intro',
        'Về chúng tôi',
        2,
        '{
          "layout": "full-text",
          "maxWidth": "1000px",
          "description": "<p>Hangchavn là đơn vị ủy quyền duy nhất của tập đoàn Hangcha tại Việt Nam. Chúng tôi chuyên cung cấp các dòng xe nâng điện, xe nâng dầu, xe nâng tay điện, xe nâng tay thấp với chất lượng và dịch vụ tốt nhất.</p><p>Với phương châm hoạt động \\"Sự hài lòng của khách hàng là niềm vinh hạnh của chúng tôi\\". Hangchavn cam kết mang đến cho khách hàng những dòng xe nâng hàng (Xe Forklift) với chất lượng tốt nhất, mức giá cạnh tranh nhất, và dịch vụ bán hàng tốt nhất trên thị trường.</p>",
          "stats": [
            {
              "id": "1",
              "value": "TOP 1",
              "label": "Tại Trung Quốc"
            },
            {
              "id": "2",
              "value": "TOP 5",
              "label": "Toàn thế giới"
            },
            {
              "id": "3",
              "value": "150+",
              "label": "Quốc gia"
            },
            {
              "id": "4",
              "value": "1M+",
              "label": "Sản phẩm/năm"
            }
          ],
          "buttonText": "Tìm hiểu thêm",
          "buttonLink": "/about",
          "backgroundColor": "var(--background)",
          "textColor": "var(--text)"
        }',
        true,
        NOW(),
        NOW()
      )
    `);

    // Update order of other sections
    await queryRunner.query(`
      UPDATE theme_sections 
      SET "order" = "order" + 1 
      WHERE theme_id = ${themeId}
      AND type != 'company_intro' 
      AND "order" >= 2
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Get active theme id
    const activeTheme = await queryRunner.query(`
      SELECT id FROM themes WHERE is_active = true LIMIT 1
    `);

    if (!activeTheme || activeTheme.length === 0) {
      throw new Error('No active theme found');
    }

    const themeId = activeTheme[0].id;

    // Remove company intro section
    await queryRunner.query(`
      DELETE FROM theme_sections 
      WHERE type = 'company_intro' 
      AND theme_id = ${themeId}
    `);

    // Restore original order
    await queryRunner.query(`
      UPDATE theme_sections 
      SET "order" = "order" - 1 
      WHERE theme_id = ${themeId}
      AND "order" > 2
    `);
  }
} 