import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCrossSellProducts1741355655640 implements MigrationInterface {
  name = 'CreateCrossSellProducts1741355655640';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "cross_sell_product" (
        "id" SERIAL NOT NULL,
        "productId" integer NOT NULL,
        "relatedProductId" integer NOT NULL,
        "position" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cross_sell_product" PRIMARY KEY ("id")
      )
    `);

    // Thêm foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "cross_sell_product" 
      ADD CONSTRAINT "FK_cross_sell_product_product" 
      FOREIGN KEY ("productId") REFERENCES "products"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "cross_sell_product" 
      ADD CONSTRAINT "FK_cross_sell_product_related_product" 
      FOREIGN KEY ("relatedProductId") REFERENCES "products"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Thêm unique constraint để tránh trùng lặp
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_cross_sell_product_unique" 
      ON "cross_sell_product" ("productId", "relatedProductId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa các constraints và index
    await queryRunner.query(`DROP INDEX "IDX_cross_sell_product_unique"`);
    await queryRunner.query(`ALTER TABLE "cross_sell_product" DROP CONSTRAINT "FK_cross_sell_product_related_product"`);
    await queryRunner.query(`ALTER TABLE "cross_sell_product" DROP CONSTRAINT "FK_cross_sell_product_product"`);
    
    // Xóa bảng
    await queryRunner.query(`DROP TABLE "cross_sell_product"`);
  }
} 