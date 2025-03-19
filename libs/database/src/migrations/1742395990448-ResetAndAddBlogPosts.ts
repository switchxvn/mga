import { MigrationInterface, QueryRunner } from 'typeorm';
import { CategoryType } from '../../../../apps/backend/src/modules/category/entities/category.entity';

export class ResetAndAddBlogPosts1742395990448 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, delete all existing data
    await queryRunner.query(`DELETE FROM post_tags`);
    await queryRunner.query(`DELETE FROM post_categories`);
    await queryRunner.query(`DELETE FROM posts`);
    await queryRunner.query(`DELETE FROM categories WHERE category_type = 'news'`);

    // Create blog categories
    const categories = [
      {
        name: 'Tin tức xe nâng',
        slug: 'tin-tuc-xe-nang',
        description: 'Cập nhật tin tức mới nhất về ngành xe nâng và logistics',
        meta_title: 'Tin Tức Xe Nâng | Forklift Solutions',
        meta_description: 'Cập nhật tin tức mới nhất về ngành xe nâng và logistics tại Forklift Solutions.'
      },
      {
        name: 'Hướng dẫn sử dụng',
        slug: 'huong-dan-su-dung',
        description: 'Hướng dẫn chi tiết về cách sử dụng và vận hành xe nâng an toàn',
        meta_title: 'Hướng Dẫn Sử Dụng Xe Nâng | Forklift Solutions',
        meta_description: 'Hướng dẫn chi tiết về cách sử dụng và vận hành xe nâng an toàn tại Forklift Solutions.'
      },
      {
        name: 'Bảo trì & Bảo dưỡng',
        slug: 'bao-tri-bao-duong',
        description: 'Thông tin về bảo trì, bảo dưỡng và sửa chữa xe nâng',
        meta_title: 'Bảo Trì & Bảo Dưỡng Xe Nâng | Forklift Solutions',
        meta_description: 'Thông tin về bảo trì, bảo dưỡng và sửa chữa xe nâng tại Forklift Solutions.'
      },
      {
        name: 'Kinh nghiệm mua xe',
        slug: 'kinh-nghiem-mua-xe',
        description: 'Những kinh nghiệm và lời khuyên khi chọn mua xe nâng',
        meta_title: 'Kinh Nghiệm Mua Xe Nâng | Forklift Solutions',
        meta_description: 'Những kinh nghiệm và lời khuyên khi chọn mua xe nâng tại Forklift Solutions.'
      }
    ];

    // Insert categories
    for (const category of categories) {
      await queryRunner.query(`
        INSERT INTO categories (
          name, slug, description, category_type, meta_title, meta_description,
          active, is_featured, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
        )
      `, [
        category.name,
        category.slug,
        category.description,
        CategoryType.NEWS,
        category.meta_title,
        category.meta_description,
        true, // active
        false // is_featured
      ]);
    }

    // Create blog posts
    const posts = [
      {
        title: 'Top 5 Xe Nâng Điện Bán Chạy Nhất 2024',
        slug: 'top-5-xe-nang-dien-ban-chay-nhat-2024',
        category_slug: 'tin-tuc-xe-nang',
        content: `Trong năm 2024, thị trường xe nâng điện đã chứng kiến sự tăng trưởng mạnh mẽ với nhiều mẫu xe ấn tượng. Bài viết này sẽ giới thiệu top 5 xe nâng điện được ưa chuộng nhất, bao gồm các model MGA từ 1.0 đến 3.0 tấn. Chúng tôi sẽ phân tích chi tiết về ưu điểm, tính năng nổi bật và lý do tại sao các model này lại được khách hàng tin dùng.

Các tiêu chí đánh giá bao gồm:
- Hiệu suất và công suất nâng
- Thời gian sử dụng pin
- Tính năng an toàn
- Chi phí vận hành
- Độ bền và chất lượng

Đặc biệt, model MGA25E với công suất 2.5 tấn đang dẫn đầu xu hướng với công nghệ pin lithium-ion tiên tiến và hệ thống quản lý năng lượng thông minh.`,
        short_description: 'Khám phá những mẫu xe nâng điện bán chạy nhất năm 2024 và lý do tại sao chúng được ưa chuộng',
        thumbnail: '/images/blog/top-5-electric-forklifts-2024.jpg'
      },
      {
        title: 'Hướng Dẫn Vận Hành Xe Nâng An Toàn',
        slug: 'huong-dan-van-hanh-xe-nang-an-toan',
        category_slug: 'huong-dan-su-dung',
        content: `An toàn là yếu tố quan trọng hàng đầu khi vận hành xe nâng. Bài viết này cung cấp hướng dẫn chi tiết về:

1. Kiểm tra trước khi vận hành:
   - Kiểm tra dầu và nhiên liệu
   - Kiểm tra hệ thống phanh
   - Kiểm tra bánh xe và càng nâng

2. Quy trình vận hành chuẩn:
   - Khởi động và khởi hành
   - Kỹ thuật nâng hạ hàng
   - Di chuyển an toàn trong kho

3. Xử lý tình huống khẩn cấp:
   - Quy trình dừng khẩn cấp
   - Xử lý khi xe nghiêng
   - Quy trình sơ cứu

Tuân thủ các hướng dẫn này sẽ giúp đảm bảo an toàn cho người vận hành và môi trường làm việc.`,
        short_description: 'Hướng dẫn đầy đủ về cách vận hành xe nâng an toàn và hiệu quả',
        thumbnail: '/images/blog/safe-forklift-operation.jpg'
      },
      {
        title: 'Lịch Trình Bảo Dưỡng Xe Nâng Định Kỳ',
        slug: 'lich-trinh-bao-duong-xe-nang-dinh-ky',
        category_slug: 'bao-tri-bao-duong',
        content: `Bảo dưỡng định kỳ là chìa khóa để duy trì hiệu suất và kéo dài tuổi thọ xe nâng. Dưới đây là lịch trình bảo dưỡng chi tiết:

Bảo dưỡng hàng ngày:
- Kiểm tra mức dầu và nhiên liệu
- Kiểm tra áp suất lốp
- Kiểm tra hệ thống phanh

Bảo dưỡng hàng tuần:
- Kiểm tra ắc quy
- Bôi trơn các bộ phận chuyển động
- Kiểm tra hệ thống thủy lực

Bảo dưỡng hàng tháng:
- Thay dầu động cơ
- Kiểm tra và điều chỉnh phanh
- Kiểm tra hệ thống làm mát

Bảo dưỡng hàng quý:
- Kiểm tra và thay thế các bộ lọc
- Điều chỉnh van động cơ
- Kiểm tra hệ thống điện

Việc tuân thủ lịch trình này sẽ giúp phát hiện sớm các vấn đề tiềm ẩn và giảm chi phí sửa chữa lớn.`,
        short_description: 'Hướng dẫn chi tiết về lịch trình bảo dưỡng xe nâng để đảm bảo hiệu suất tối ưu',
        thumbnail: '/images/blog/forklift-maintenance-schedule.jpg'
      },
      {
        title: '5 Yếu Tố Quan Trọng Khi Chọn Mua Xe Nâng',
        slug: '5-yeu-to-quan-trong-khi-chon-mua-xe-nang',
        category_slug: 'kinh-nghiem-mua-xe',
        content: `Việc lựa chọn xe nâng phù hợp đóng vai trò quan trọng trong hiệu quả hoạt động của doanh nghiệp. Dưới đây là 5 yếu tố quan trọng cần cân nhắc:

1. Nhu cầu sử dụng:
   - Tải trọng nâng cần thiết
   - Môi trường làm việc
   - Tần suất sử dụng

2. Chi phí đầu tư:
   - Giá mua xe
   - Chi phí vận hành
   - Chi phí bảo dưỡng

3. Loại nhiên liệu:
   - Xe nâng điện
   - Xe nâng dầu diesel
   - Xe nâng gas

4. Kích thước và tính linh hoạt:
   - Chiều cao nâng tối đa
   - Bán kính quay vòng
   - Khả năng di chuyển trong không gian hẹp

5. Dịch vụ hậu mãi:
   - Chế độ bảo hành
   - Dịch vụ bảo trì
   - Cung cấp phụ tùng

Bài viết này sẽ phân tích chi tiết từng yếu tố để giúp bạn đưa ra quyết định đúng đắn.`,
        short_description: 'Khám phá những yếu tố quan trọng cần cân nhắc khi chọn mua xe nâng cho doanh nghiệp',
        thumbnail: '/images/blog/forklift-buying-guide.jpg'
      }
    ];

    // Insert posts
    for (const post of posts) {
      // Get category id
      const categoryResult = await queryRunner.query(`
        SELECT id FROM categories
        WHERE slug = $1 AND category_type = $2
      `, [post.category_slug, CategoryType.NEWS]);

      if (categoryResult.length === 0) {
        continue;
      }

      const categoryId = categoryResult[0].id;

      // Insert post
      const result = await queryRunner.query(`
        INSERT INTO posts (
          title, content, short_description, thumbnail, published, author_id,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, NOW(), NOW()
        ) RETURNING id
      `, [
        post.title,
        post.content,
        post.short_description,
        post.thumbnail,
        true, // published
        1 // author_id (assuming admin user has id 1)
      ]);

      const postId = result[0].id;

      // Link post to category
      await queryRunner.query(`
        INSERT INTO post_categories (post_id, category_id)
        VALUES ($1, $2)
      `, [postId, categoryId]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete all blog posts and categories
    await queryRunner.query(`DELETE FROM post_tags`);
    await queryRunner.query(`DELETE FROM post_categories`);
    await queryRunner.query(`DELETE FROM posts`);
    await queryRunner.query(`DELETE FROM categories WHERE category_type = 'news'`);
  }
} 