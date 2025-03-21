import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCompanyIntroContent1742488788554 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get active theme id
    const activeTheme = await queryRunner.query(`
      SELECT id FROM themes WHERE is_active = true LIMIT 1
    `);

    if (!activeTheme || activeTheme.length === 0) {
      throw new Error('No active theme found');
    }

    const themeId = activeTheme[0].id;

    // Update company intro section settings
    await queryRunner.query(`
      UPDATE theme_sections 
      SET settings = settings || 
        '{
          "maxWidth": "100%",
          "description": "<div style=\\"border: 1px solid #ff9800; padding: 20px; border-radius: 5px;\\"> <h2 style=\\"color: #ff9800; text-align: center;\\">GIỚI THIỆU MGA VIỆT NAM</h2> <p> <strong style=\\"color: #ff9800;\\">Mgavietnam</strong> – Đơn vị chuyên cung cấp các dòng <strong style=\\"color: #ff9800;\\">xe nâng điện, xe nâng dầu, xe nâng tay điện, xe nâng tay thấp, xe nâng tay cao</strong> với chất lượng và dịch vụ tốt nhất. </p> <p> Với phương châm hoạt động <em>\\"Sự hài lòng của khách hàng là niềm vinh hạnh của chúng tôi\\"</em>. Mgavietnam cam kết mang đến cho khách hàng những dòng xe nâng hàng (<strong>Xe Forklift</strong>) với chất lượng tốt nhất, mức giá cạnh tranh nhất, và dịch vụ bán hàng tốt nhất trên thị trường. </p> <p> Dịch vụ sau bán hàng chu đáo – Mgavietnam cung cấp dịch vụ sau bán hàng tốt, với hệ thống xưởng dịch vụ xe nâng, kho phụ tùng xe nâng rộng khắp cả nước. Mgavietnam sẵn sàng hỗ trợ bạn <strong style=\\"color: #ff9800;\\">24/7</strong> cho dù bạn ở đâu, bất cứ khi nào bạn cần. </p> </div>",
          "stats": [
            {
              "id": "1",
              "value": "10+",
              "label": "Năm kinh nghiệm"
            },
            {
              "id": "2",
              "value": "1000+",
              "label": "Khách hàng"
            },
            {
              "id": "3",
              "value": "24/7",
              "label": "Hỗ trợ kỹ thuật"
            },
            {
              "id": "4",
              "value": "100%",
              "label": "Khách hàng hài lòng"
            }
          ]
        }'::jsonb
      WHERE theme_id = ${themeId}
      AND type = 'company_intro'
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

    // Restore previous settings
    await queryRunner.query(`
      UPDATE theme_sections 
      SET settings = settings || 
        '{
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
          ]
        }'::jsonb
      WHERE theme_id = ${themeId}
      AND type = 'company_intro'
    `);
  }
} 