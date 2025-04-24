import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVideoIntroWithTextSection1743270380247 implements MigrationInterface {
  name = 'AddVideoIntroWithTextSection1743270380247';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get default theme id
    const themeResult = await queryRunner.query(`
      SELECT id FROM themes WHERE name = 'Default Theme' LIMIT 1
    `);
    const themeId = themeResult[0].id;

    // Add video intro with text section
    await queryRunner.query(`
      INSERT INTO theme_sections (theme_id, type, component_name, title, "order", page_type, settings)
      VALUES (
        ${themeId},
        'video-intro-with-text',
        'VideoIntroWithTextSection',
        'Giới thiệu Cáp treo Núi Sam',
        4,
        'home_page',
        '{
          "layout": "split-columns",
          "textColumnWidth": "70%",
          "videoColumnWidth": "30%",
          "description": "<h2>Cáp treo Núi Sam - Điểm đến tâm linh và giải trí hàng đầu tại An Giang</h2><p>Được đầu tư và phát triển bởi Công ty TNHH MGA, Cáp treo Núi Sam là công trình hiện đại bậc nhất tại khu vực Đồng bằng sông Cửu Long. Với chiều dài hơn 1.2km, hệ thống cáp treo hiện đại cùng cabin sang trọng, an toàn, chúng tôi mang đến cho du khách trải nghiệm tham quan Núi Sam từ trên cao độc đáo và ấn tượng.</p><p>Từ độ cao 250m so với mực nước biển, du khách có thể chiêm ngưỡng toàn cảnh thành phố Châu Đốc, dòng sông Hậu và đồng bằng Châu Đốc - An Giang trù phú. Đặc biệt, cáp treo Núi Sam còn là cửa ngõ thuận tiện để du khách đến tham quan và chiêm bái các công trình tâm linh nổi tiếng trên đỉnh Núi Sam.</p>",
          "buttonText": "Đặt vé ngay",
          "buttonLink": "/ticket-booking",
          "backgroundColor": "bg-gray-50",
          "textColor": "text-gray-900",
          "darkMode": {
            "backgroundColor": "bg-gray-900",
            "textColor": "text-gray-100",
            "buttonStyle": {
              "backgroundColor": "bg-primary-500",
              "textColor": "text-white"
            }
          },
          "buttonStyle": {
            "padding": "px-6 py-3",
            "fontSize": "text-lg",
            "fontWeight": "font-semibold",
            "backgroundColor": "bg-primary-500",
            "textColor": "text-white"
          },
          "videoSettings": {
            "autoplay": true,
            "interval": 5000,
            "showDots": true,
            "showArrows": true,
            "maxVideos": 3
          }
        }'::jsonb
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM theme_sections
      WHERE type = 'video-intro-with-text'
    `);
  }
} 