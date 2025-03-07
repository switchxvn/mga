import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePriceRequestsTable1741374280287 implements MigrationInterface {
  name = 'CreatePriceRequestsTable1741374280287';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "price_requests" (
        "id" SERIAL NOT NULL,
        "full_name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "phone" character varying NOT NULL,
        "message" text,
        "product_id" integer NOT NULL,
        "product_name" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_price_requests_id" PRIMARY KEY ("id")
      )
    `);

    // Thêm foreign key để liên kết với bảng products
    await queryRunner.query(`
      ALTER TABLE "price_requests" 
      ADD CONSTRAINT "FK_price_requests_product_id" 
      FOREIGN KEY ("product_id") 
      REFERENCES "products"("id") 
      ON DELETE CASCADE 
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa foreign key trước
    await queryRunner.query(`
      ALTER TABLE "price_requests" 
      DROP CONSTRAINT "FK_price_requests_product_id"
    `);

    // Xóa bảng
    await queryRunner.query(`DROP TABLE "price_requests"`);
  }
}