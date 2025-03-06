import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedServicesData1741272460000 implements MigrationInterface {
  name = 'SeedServicesData1741272460000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO services (title, description, icon, "order", is_active, created_at, updated_at)
      VALUES 
        ('Thiết kế website', 'Chúng tôi cung cấp dịch vụ thiết kế website chuyên nghiệp, tối ưu trải nghiệm người dùng và tương thích với mọi thiết bị.', 'fas fa-laptop-code', 1, true, NOW(), NOW()),
        
        ('Phát triển ứng dụng di động', 'Phát triển ứng dụng di động đa nền tảng (iOS, Android) với giao diện đẹp và hiệu suất cao.', 'fas fa-mobile-alt', 2, true, NOW(), NOW()),
        
        ('Tư vấn giải pháp công nghệ', 'Đội ngũ chuyên gia của chúng tôi sẽ tư vấn và đề xuất giải pháp công nghệ phù hợp nhất cho doanh nghiệp của bạn.', 'fas fa-lightbulb', 3, true, NOW(), NOW()),
        
        ('Bảo trì và hỗ trợ kỹ thuật', 'Dịch vụ bảo trì, nâng cấp và hỗ trợ kỹ thuật 24/7 cho các hệ thống đang vận hành.', 'fas fa-headset', 4, true, NOW(), NOW()),
        
        ('Tối ưu hóa SEO', 'Giúp website của bạn đạt thứ hạng cao trên các công cụ tìm kiếm thông qua các chiến lược SEO hiệu quả.', 'fas fa-search', 5, true, NOW(), NOW()),
        
        ('Phát triển phần mềm tùy chỉnh', 'Xây dựng phần mềm đáp ứng đúng nhu cầu đặc thù của doanh nghiệp với công nghệ hiện đại.', 'fas fa-code', 6, true, NOW(), NOW())
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM services WHERE title IN (
      'Thiết kế website', 
      'Phát triển ứng dụng di động', 
      'Tư vấn giải pháp công nghệ', 
      'Bảo trì và hỗ trợ kỹ thuật', 
      'Tối ưu hóa SEO', 
      'Phát triển phần mềm tùy chỉnh'
    )`);
  }
} 