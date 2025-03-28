import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNuiSamHeroSliders1743000000022 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "hero_slider" 
      ("title", "description", "image_url", "button_text", "button_link", "is_active", "order")
      VALUES 
      (
        'Dự án cáp treo Núi Sam - Châu Đốc An Giang',
        'Khám phá vẻ đẹp tâm linh và thiên nhiên tuyệt vời tại Núi Sam qua hệ thống cáp treo hiện đại',
        'https://bazantravel.com/cdn/medias/uploads/62/62266-nui-sam-chau-doc-an-giang-700x389.jpg',
        'Khám phá ngay',
        '/projects/cap-treo-nui-sam',
        true,
        1
      ),
      (
        'Cáp treo Núi Sam - Điểm đến du lịch mới',
        'Trải nghiệm góc nhìn toàn cảnh từ độ cao 284m với hệ thống cáp treo hiện đại',
        'https://thdtourist.vn/wp-content/uploads/2024/03/cd.jpg',
        'Xem thêm',
        '/projects/cap-treo-nui-sam/overview',
        true,
        2
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "hero_slider" 
      WHERE "image_url" IN (
        'https://bazantravel.com/cdn/medias/uploads/62/62266-nui-sam-chau-doc-an-giang-700x389.jpg',
        'https://thdtourist.vn/wp-content/uploads/2024/03/cd.jpg'
      );
    `);
  }
} 