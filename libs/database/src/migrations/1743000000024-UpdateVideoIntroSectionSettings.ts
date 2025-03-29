import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateVideoIntroSectionSettings1743000000024 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        settings,
        '{sliderSettings}',
        '{"dots": true, "arrows": true, "autoplay": true, "pauseOnHover": true, "autoplaySpeed": 5000, "slidesPerView": 3}'::jsonb
      )
      WHERE type = 'video_intro';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        settings,
        '{sliderSettings}',
        '{"dots": true, "arrows": true, "autoplay": true, "pauseOnHover": true, "autoplaySpeed": 5000}'::jsonb
      )
      WHERE type = 'video_intro';
    `);
  }
} 