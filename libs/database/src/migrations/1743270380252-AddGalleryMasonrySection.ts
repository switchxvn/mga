import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGalleryMasonrySection1743270380252 implements MigrationInterface {
  name = 'AddGalleryMasonrySection1743270380252';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get default theme id
    const themeResult = await queryRunner.query(`
      SELECT id FROM themes WHERE name = 'Default Theme' LIMIT 1
    `);
    const themeId = themeResult[0].id;

    // Add gallery masonry section with default settings
    await queryRunner.query(`
      INSERT INTO theme_sections (theme_id, type, component_name, title, "order", settings, page_type)
      VALUES (
        ${themeId},
        'gallery',
        'GalleryMasonrySection',
        'Thư viện hình ảnh',
        8,
        '{
          "layout": "masonry",
          "columns": {
            "sm": 1,
            "md": 2,
            "lg": 3,
            "xl": 4
          },
          "gap": "1rem",
          "padding": {
            "top": "4rem",
            "bottom": "4rem"
          },
          "maxItems": 12,
          "showTitle": true,
          "showDescription": true,
          "titleAlignment": "center",
          "colors": {
            "title": "text-gray-900 dark:text-white",
            "description": "text-gray-600 dark:text-gray-400",
            "background": "bg-white dark:bg-gray-900"
          },
          "imageHoverEffect": "zoom",
          "loadMoreButton": {
            "show": true,
            "text": "Xem thêm",
            "style": "primary"
          },
          "lightbox": {
            "enabled": true,
            "showCaption": true,
            "showThumbnails": true
          }
        }'::jsonb,
        'home_page'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove gallery section
    await queryRunner.query(`
      DELETE FROM theme_sections
      WHERE type = 'gallery' AND component_name = 'GalleryMasonrySection'
    `);
  }
} 