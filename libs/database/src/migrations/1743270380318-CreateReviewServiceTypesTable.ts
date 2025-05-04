import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReviewServiceTypesTable1743270380318 implements MigrationInterface {
  name = 'CreateReviewServiceTypesTable1743270380318';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng review_service_types
    await queryRunner.query(`
      CREATE TABLE "review_service_types" (
        "id" SERIAL NOT NULL,
        "slug" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_review_service_types_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_review_service_types" PRIMARY KEY ("id")
      )
    `);
    
    // Tạo bảng translations cho service types
    await queryRunner.query(`
      CREATE TABLE "review_service_type_translations" (
        "id" SERIAL NOT NULL,
        "locale" character varying(2) NOT NULL,
        "name" character varying NOT NULL,
        "service_type_id" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_review_service_type_translations_locale_service_type_id" UNIQUE ("locale", "service_type_id"),
        CONSTRAINT "PK_review_service_type_translations" PRIMARY KEY ("id")
      )
    `);
    
    // Tạo foreign key
    await queryRunner.query(`
      ALTER TABLE "review_service_type_translations" 
      ADD CONSTRAINT "FK_review_service_type_translations_service_type" 
      FOREIGN KEY ("service_type_id") 
      REFERENCES "review_service_types"("id") 
      ON DELETE CASCADE
    `);
    
    // Thêm dữ liệu mẫu
    await queryRunner.query(`
      INSERT INTO "review_service_types" (slug) VALUES 
      ('cable_car'),
      ('restaurant'),
      ('ticket_service'),
      ('customer_service')
    `);
    
    // Thêm translations
    await queryRunner.query(`
      INSERT INTO "review_service_type_translations" (locale, name, service_type_id) VALUES 
      ('en', 'Cable Car', 1),
      ('vi', 'Cáp treo', 1),
      ('en', 'Restaurant', 2),
      ('vi', 'Nhà hàng', 2),
      ('en', 'Ticket Service', 3),
      ('vi', 'Dịch vụ vé', 3),
      ('en', 'Customer Service', 4),
      ('vi', 'Dịch vụ khách hàng', 4)
    `);
    
    // Thêm cột service_type_id vào bảng reviews
    await queryRunner.query(`
      ALTER TABLE "reviews" ADD COLUMN "service_type_id" integer NULL;
    `);
    
    // Cập nhật service_type_id dựa trên service_type
    await queryRunner.query(`
      UPDATE "reviews" r
      SET "service_type_id" = rst.id
      FROM "review_service_types" rst
      WHERE r."service_type" = rst.slug;
    `);
    
    // Thêm foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "reviews" 
      ADD CONSTRAINT "FK_reviews_service_type" 
      FOREIGN KEY ("service_type_id") 
      REFERENCES "review_service_types"("id")
    `);
    
    // Xóa cột service_type sau khi đã cập nhật service_type_id
    await queryRunner.query(`
      ALTER TABLE "reviews" DROP COLUMN IF EXISTS "service_type";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "reviews" DROP CONSTRAINT IF EXISTS "FK_reviews_service_type";
    `);
    
    // Thêm lại cột service_type
    await queryRunner.query(`
      ALTER TABLE "reviews" ADD COLUMN "service_type" character varying NULL;
    `);
    
    // Cập nhật service_type dựa trên service_type_id
    await queryRunner.query(`
      UPDATE "reviews" r
      SET "service_type" = rst.slug
      FROM "review_service_types" rst
      WHERE r."service_type_id" = rst.id;
    `);
    
    // Xóa cột service_type_id
    await queryRunner.query(`
      ALTER TABLE "reviews" DROP COLUMN IF EXISTS "service_type_id";
    `);
    
    // Xóa bảng translations
    await queryRunner.query(`
      DROP TABLE IF EXISTS "review_service_type_translations";
    `);
    
    // Xóa bảng service types
    await queryRunner.query(`
      DROP TABLE IF EXISTS "review_service_types";
    `);
  }
} 