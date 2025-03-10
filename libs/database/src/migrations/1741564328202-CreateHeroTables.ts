import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHeroTables1741564328202 implements MigrationInterface {
  name = 'CreateHeroTables1741564328202';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "hero" (
        "id" SERIAL NOT NULL,
        "title" character varying(255) NOT NULL,
        "description" text,
        "button_text" character varying(255),
        "button_link" character varying(255),
        "video_url" character varying(255),
        "is_active" boolean NOT NULL DEFAULT true,
        "order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_c5f115191a5ed9789d6b2236aa6" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "hero_slider" (
        "id" SERIAL NOT NULL,
        "title" character varying(255) NOT NULL,
        "description" text,
        "image_url" character varying(255) NOT NULL,
        "button_text" character varying(255),
        "button_link" character varying(255),
        "is_active" boolean NOT NULL DEFAULT true,
        "order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_c6c6e8c5e4c7f4e3a9b2b2b2b2b" PRIMARY KEY ("id")
      )
    `);

    // Insert default hero data
    await queryRunner.query(`
      INSERT INTO "hero" ("title", "description", "button_text", "button_link", "video_url", "is_active", "order")
      VALUES ('Welcome to Our Store', 'Discover amazing products and services', 'Shop Now', '/products', 'https://example.com/video.mp4', true, 0)
    `);

    // Insert default hero slider data
    await queryRunner.query(`
      INSERT INTO "hero_slider" ("title", "description", "image_url", "button_text", "button_link", "is_active", "order")
      VALUES 
        ('Summer Collection', 'Explore our new summer collection', 'https://example.com/slider1.jpg', 'Explore', '/summer-collection', true, 0),
        ('Special Offers', 'Limited time discounts on selected items', 'https://example.com/slider2.jpg', 'View Offers', '/special-offers', true, 1),
        ('New Arrivals', 'Check out our latest products', 'https://example.com/slider3.jpg', 'Shop Now', '/new-arrivals', true, 2)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "hero_slider"`);
    await queryRunner.query(`DROP TABLE "hero"`);
  }
} 