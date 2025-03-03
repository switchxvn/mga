import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMenuItemsAndLogos1740993000000 implements MigrationInterface {
  name = 'CreateMenuItemsAndLogos1740993000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create menu_items table
    await queryRunner.query(`
      CREATE TABLE "menu_items" (
        "id" SERIAL NOT NULL,
        "label" character varying NOT NULL,
        "href" character varying NOT NULL,
        "has_mega_menu" boolean NOT NULL DEFAULT false,
        "icon" character varying,
        "order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "parent_id" integer,
        "mega_menu_columns" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_menu_items_id" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key for self-referencing relationship
    await queryRunner.query(`
      ALTER TABLE "menu_items" ADD CONSTRAINT "FK_menu_items_parent"
      FOREIGN KEY ("parent_id") REFERENCES "menu_items"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Create logos table
    await queryRunner.query(`
      CREATE TABLE "logos" (
        "id" SERIAL NOT NULL,
        "url" character varying NOT NULL,
        "alt_text" character varying,
        "type" character varying NOT NULL DEFAULT 'main',
        "is_active" boolean NOT NULL DEFAULT true,
        "width" integer,
        "height" integer,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_logos_id" PRIMARY KEY ("id")
      )
    `);

    // Insert default menu items
    await queryRunner.query(`
      INSERT INTO "menu_items" ("label", "href", "has_mega_menu", "order", "is_active")
      VALUES 
        ('Trang chủ', '/', false, 1, true),
        ('Sản phẩm', '/products', true, 2, true),
        ('Bài viết', '/posts', true, 3, true),
        ('Giới thiệu', '/about', false, 4, true),
        ('Liên hệ', '/contact', false, 5, true)
    `);

    // Get the ID of the "Sản phẩm" menu item
    const productsMenuResult = await queryRunner.query(`
      SELECT id FROM "menu_items" WHERE "label" = 'Sản phẩm'
    `);
    const productsMenuId = productsMenuResult[0].id;

    // Add mega_menu_columns data to "Sản phẩm" menu item
    await queryRunner.query(`
      UPDATE "menu_items"
      SET "mega_menu_columns" = '[
        {
          "title": "Danh mục sản phẩm",
          "items": [
            { "label": "Điện thoại", "href": "/products/phones" },
            { "label": "Laptop", "href": "/products/laptops" },
            { "label": "Máy tính bảng", "href": "/products/tablets" },
            { "label": "Phụ kiện", "href": "/products/accessories" }
          ]
        },
        {
          "title": "Thương hiệu",
          "items": [
            { "label": "Apple", "href": "/products/brand/apple" },
            { "label": "Samsung", "href": "/products/brand/samsung" },
            { "label": "Xiaomi", "href": "/products/brand/xiaomi" },
            { "label": "Asus", "href": "/products/brand/asus" }
          ]
        },
        {
          "title": "Mức giá",
          "items": [
            { "label": "Dưới 5 triệu", "href": "/products/price/under-5m" },
            { "label": "5 - 10 triệu", "href": "/products/price/5m-10m" },
            { "label": "10 - 20 triệu", "href": "/products/price/10m-20m" },
            { "label": "Trên 20 triệu", "href": "/products/price/above-20m" }
          ]
        }
      ]'::jsonb
      WHERE id = ${productsMenuId}
    `);

    // Get the ID of the "Bài viết" menu item
    const postsMenuResult = await queryRunner.query(`
      SELECT id FROM "menu_items" WHERE "label" = 'Bài viết'
    `);
    const postsMenuId = postsMenuResult[0].id;

    // Add mega_menu_columns data to "Bài viết" menu item
    await queryRunner.query(`
      UPDATE "menu_items"
      SET "mega_menu_columns" = '[
        {
          "title": "Chủ đề",
          "items": [
            { "label": "Công nghệ", "href": "/posts/tech" },
            { "label": "Đánh giá", "href": "/posts/reviews" },
            { "label": "Hướng dẫn", "href": "/posts/guides" },
            { "label": "Tin tức", "href": "/posts/news" }
          ]
        },
        {
          "title": "Bài viết nổi bật",
          "items": [
            { "label": "Top 10 điện thoại 2023", "href": "/posts/top-phones-2023" },
            { "label": "So sánh iPhone vs Samsung", "href": "/posts/iphone-vs-samsung" },
            { "label": "Mẹo tiết kiệm pin", "href": "/posts/battery-tips" }
          ]
        }
      ]'::jsonb
      WHERE id = ${postsMenuId}
    `);

    // Insert default logo
    await queryRunner.query(`
      INSERT INTO "logos" ("url", "alt_text", "type", "is_active", "width", "height")
      VALUES ('/logo.svg', 'E-Commerce Logo', 'main', true, 200, 80)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    await queryRunner.query(`
      ALTER TABLE "menu_items" DROP CONSTRAINT "FK_menu_items_parent"
    `);

    // Drop tables
    await queryRunner.query(`DROP TABLE "menu_items"`);
    await queryRunner.query(`DROP TABLE "logos"`);
  }
} 