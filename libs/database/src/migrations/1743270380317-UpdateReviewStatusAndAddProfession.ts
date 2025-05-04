import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateReviewStatusAndAddProfession1743270380317 implements MigrationInterface {
  name = 'UpdateReviewStatusAndAddProfession1743270380317';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Thêm enum status
    await queryRunner.query(`
      CREATE TYPE "review_status_enum" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');
    `);
    
    // Thêm cột profession
    await queryRunner.query(`
      ALTER TABLE "reviews" ADD COLUMN "profession" varchar NULL;
    `);
    
    // Thêm cột status mới
    await queryRunner.query(`
      ALTER TABLE "reviews" ADD COLUMN "status" "review_status_enum" NOT NULL DEFAULT 'ACTIVE'::"review_status_enum";
    `);
    
    // Cập nhật giá trị status dựa trên is_active
    await queryRunner.query(`
      UPDATE "reviews" SET "status" = CASE
        WHEN "is_active" = true THEN 'ACTIVE'::"review_status_enum"
        ELSE 'INACTIVE'::"review_status_enum"
      END;
    `);
    
    // Xóa cột is_active
    await queryRunner.query(`
      ALTER TABLE "reviews" DROP COLUMN "is_active";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Thêm lại cột is_active
    await queryRunner.query(`
      ALTER TABLE "reviews" ADD COLUMN "is_active" boolean NOT NULL DEFAULT true;
    `);
    
    // Cập nhật giá trị is_active dựa trên status
    await queryRunner.query(`
      UPDATE "reviews" SET "is_active" = CASE
        WHEN "status" = 'ACTIVE'::"review_status_enum" THEN true
        ELSE false
      END;
    `);
    
    // Xóa cột status
    await queryRunner.query(`
      ALTER TABLE "reviews" DROP COLUMN "status";
    `);
    
    // Xóa cột profession
    await queryRunner.query(`
      ALTER TABLE "reviews" DROP COLUMN "profession";
    `);
    
    // Xóa enum status
    await queryRunner.query(`
      DROP TYPE "review_status_enum";
    `);
  }
} 