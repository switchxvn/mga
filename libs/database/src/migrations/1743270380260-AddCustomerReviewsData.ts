import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomerReviewsData1743270380260 implements MigrationInterface {
  name = 'AddCustomerReviewsData1743270380260';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get default theme id
    const themeResult = await queryRunner.query(`
      SELECT id FROM themes WHERE name = 'Default Theme' LIMIT 1
    `);
    const themeId = themeResult[0].id;

    // Get customer reviews section id
    const sectionResult = await queryRunner.query(`
      SELECT id FROM theme_sections 
      WHERE theme_id = ${themeId} AND type = 'customer_reviews' 
      LIMIT 1
    `);
    const sectionId = sectionResult[0].id;

    // Add customer reviews data
    await queryRunner.query(`
      UPDATE theme_sections 
      SET settings = jsonb_set(
        settings, 
        '{reviews}', 
        '[
          {
            "id": 1,
            "name": "Nguyễn Văn An",
            "avatar": "/images/reviews/avatar1.jpg",
            "rating": 5,
            "comment": "Món ăn tại đây thực sự tuyệt vời! Tôi đặc biệt ấn tượng với hương vị đặc trưng của các món đặc sản vùng miền. Không gian nhà hàng thoáng đãng, view đẹp, nhân viên phục vụ chuyên nghiệp.",
            "position": "Khách du lịch",
            "date": "2024-03-15"
          },
          {
            "id": 2,
            "name": "Trần Thị Bình",
            "avatar": "/images/reviews/avatar2.jpg",
            "rating": 5,
            "comment": "Trải nghiệm cáp treo Núi Sam thật tuyệt vời! Từ trên cao, tôi có thể ngắm nhìn toàn cảnh thành phố Châu Đốc và dòng sông Hậu uốn lượn. Đây là điểm đến không thể bỏ qua khi đến An Giang.",
            "position": "Blogger du lịch",
            "date": "2024-03-10"
          },
          {
            "id": 3,
            "name": "Lê Văn Cường",
            "avatar": "/images/reviews/avatar3.jpg",
            "rating": 5,
            "comment": "Các món ăn đặc sản tại đây được chế biến rất chuẩn vị, đặc biệt là món cá nướng và lẩu mắm. Giá cả hợp lý, phục vụ tận tình. Sẽ quay lại lần sau!",
            "position": "Doanh nhân",
            "date": "2024-03-08"
          },
          {
            "id": 4,
            "name": "Phạm Thị Dung",
            "avatar": "/images/reviews/avatar4.jpg",
            "rating": 5,
            "comment": "Cáp treo Núi Sam là trải nghiệm tuyệt vời cho cả gia đình. Các con tôi rất thích thú với chuyến đi này. Cảnh quan thiên nhiên tuyệt đẹp, không khí trong lành.",
            "position": "Giáo viên",
            "date": "2024-03-05"
          },
          {
            "id": 5,
            "name": "Hoàng Văn Em",
            "avatar": "/images/reviews/avatar5.jpg",
            "rating": 5,
            "comment": "Nhà hàng phục vụ rất chuyên nghiệp, món ăn ngon và presentation đẹp mắt. Đặc biệt là các món hải sản tươi sống và các món đặc sản vùng miền.",
            "position": "Đầu bếp",
            "date": "2024-03-01"
          },
          {
            "id": 6,
            "name": "Mai Thị Phương",
            "avatar": "/images/reviews/avatar6.jpg",
            "rating": 5,
            "comment": "Đi cáp treo ngắm hoàng hôn trên đỉnh Núi Sam là một trải nghiệm khó quên. View tuyệt đẹp, nhân viên thân thiện và nhiệt tình. Giá vé hợp lý cho một trải nghiệm tuyệt vời như vậy.",
            "position": "Nhiếp ảnh gia",
            "date": "2024-02-28"
          }
        ]'::jsonb
      )
      WHERE id = ${sectionId}
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Get default theme id
    const themeResult = await queryRunner.query(`
      SELECT id FROM themes WHERE name = 'Default Theme' LIMIT 1
    `);
    const themeId = themeResult[0].id;

    // Get customer reviews section id
    const sectionResult = await queryRunner.query(`
      SELECT id FROM theme_sections 
      WHERE theme_id = ${themeId} AND type = 'customer_reviews' 
      LIMIT 1
    `);
    const sectionId = sectionResult[0].id;

    // Remove reviews data
    await queryRunner.query(`
      UPDATE theme_sections 
      SET settings = settings - 'reviews'
      WHERE id = ${sectionId}
    `);
  }
} 