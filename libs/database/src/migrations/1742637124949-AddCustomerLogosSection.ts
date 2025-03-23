import { MigrationInterface, QueryRunner, Table } from 'typeorm';

// Define PageType enum directly since we can't import from @ew/shared in migrations
enum PageType {
  HOME_PAGE = 'home_page',
  ABOUT_PAGE = 'about_page',
  CONTACT_PAGE = 'contact_page',
  PRODUCT_PAGE = 'product_page',
  CATEGORY_PAGE = 'category_page',
  BLOG_PAGE = 'blog_page',
  POST_PAGE = 'post_page',
}

export class AddCustomerLogosSection1742637124949 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create customer_logos table
    await queryRunner.createTable(
      new Table({
        name: 'customer_logos',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'image_url',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'alt',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'link',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'order',
            type: 'int',
            default: 0,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Get the active theme
    const activeTheme = await queryRunner.query(
      `SELECT id FROM themes WHERE is_active = true LIMIT 1`
    );

    if (activeTheme && activeTheme[0]) {
      // Insert default customer logos section into theme_sections
      await queryRunner.query(`
        INSERT INTO theme_sections (
          theme_id,
          type,
          component_name,
          title,
          "order",
          page_type,
          settings,
          is_active
        ) VALUES (
          ${activeTheme[0].id},
          'customer_logos',
          'CustomerLogosSection',
          'Khách hàng tiêu biểu',
          8,
          '${PageType.HOME_PAGE}',
          '{
            "displayType": "grid",
            "gridColumns": {
              "base": 2,
              "sm": 3,
              "md": 4,
              "lg": 5,
              "xl": 6
            },
            "gap": "2rem",
            "logoHeight": "80px",
            "logoWidth": "auto",
            "backgroundColor": "",
            "containerPadding": "4rem",
            "showTitle": true,
            "titleAlignment": "center",
            "autoplay": true,
            "interval": 3000,
            "showArrows": true,
            "slidesToShow": {
              "base": 2,
              "sm": 3,
              "md": 4,
              "lg": 5,
              "xl": 6
            },
            "darkMode": {
              "backgroundColor": "",
              "textColor": ""
            }
          }'::jsonb,
          true
        );
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM theme_sections
      WHERE type = 'customer_logos';
    `);
    await queryRunner.dropTable('customer_logos');
  }
} 