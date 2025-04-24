import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNewsSectionSettings1743270380270 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Cập nhật settings cho các theme sections có type là 'news'
    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        settings,
        '{postIds}',
        '[]'::jsonb
      )
      WHERE type = 'news';
    `);

    // Cập nhật các settings khác nếu cần
    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        settings,
        '{showDate}',
        'true'::jsonb
      )
      WHERE type = 'news' AND NOT settings ? 'showDate';
    `);

    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        settings,
        '{showAuthor}',
        'true'::jsonb
      )
      WHERE type = 'news' AND NOT settings ? 'showAuthor';
    `);

    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        settings,
        '{showExcerpt}',
        'true'::jsonb
      )
      WHERE type = 'news' AND NOT settings ? 'showExcerpt';
    `);

    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        settings,
        '{excerptLength}',
        '120'::jsonb
      )
      WHERE type = 'news' AND NOT settings ? 'excerptLength';
    `);

    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        settings,
        '{imageAspectRatio}',
        '"16/9"'::jsonb
      )
      WHERE type = 'news' AND NOT settings ? 'imageAspectRatio';
    `);

    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        settings,
        '{overlayOpacity}',
        '0.5'::jsonb
      )
      WHERE type = 'news' AND NOT settings ? 'overlayOpacity';
    `);

    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        settings,
        '{backgroundGradient}',
        '{"to": "rgba(0,0,0,0)", "from": "rgba(0,0,0,0.7)", "direction": "to-t"}'::jsonb
      )
      WHERE type = 'news' AND NOT settings ? 'backgroundGradient';
    `);

    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        settings,
        '{buttonText}',
        '"Xem thêm"'::jsonb
      )
      WHERE type = 'news' AND NOT settings ? 'buttonText';
    `);

    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        settings,
        '{buttonStyle}',
        '"primary"'::jsonb
      )
      WHERE type = 'news' AND NOT settings ? 'buttonStyle';
    `);

    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        settings,
        '{padding}',
        '{"top": "2rem", "bottom": "2rem"}'::jsonb
      )
      WHERE type = 'news' AND NOT settings ? 'padding';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Không cần rollback vì chúng ta chỉ thêm trường mới và giá trị mặc định
    // Nếu cần rollback, có thể xóa trường postIds
    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = settings - 'postIds'
      WHERE type = 'news';
    `);
  }
} 