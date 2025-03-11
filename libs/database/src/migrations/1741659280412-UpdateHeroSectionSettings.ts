import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateHeroSectionSettings1741659280412 implements MigrationInterface {
  name = 'UpdateHeroSectionSettings1741659280412';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Cập nhật cấu hình cho hero section
    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              settings,
              '{videoWidth}',
              '"30%"'
            ),
            '{sliderWidth}',
            '"70%"'
          ),
          '{backgroundGradient}',
          '{"from": "rgba(0,0,0,0.7)", "to": "rgba(0,0,0,0)", "direction": "to-right"}'
        ),
        '{overlayOpacity}',
        '"0.5"'
      )
      WHERE type = 'hero'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Khôi phục cấu hình cũ
    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        jsonb_set(
          settings,
          '{videoWidth}',
          '"32%"'
        ),
        '{sliderWidth}',
        '"68%"'
      ) - 'backgroundGradient' - 'overlayOpacity'
      WHERE type = 'hero'
    `);
  }
} 