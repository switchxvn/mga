import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateFeatureFlags1741400695446 implements MigrationInterface {
    name = 'CreateFeatureFlags1741400695446'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tạo bảng feature_flags
        await queryRunner.query(`CREATE TABLE "feature_flags" (
            "id" SERIAL NOT NULL, 
            "key" character varying NOT NULL, 
            "enabled" boolean NOT NULL DEFAULT true, 
            "group" character varying, 
            "description" character varying, 
            "config" json, 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "UQ_feature_flags_key" UNIQUE ("key"), 
            CONSTRAINT "PK_feature_flags" PRIMARY KEY ("id")
        )`);

        // Thêm dữ liệu mặc định
        await queryRunner.query(`INSERT INTO "feature_flags" ("key", "enabled", "group", "description") 
        VALUES ('enable_add_to_cart', true, 'cart', 'Cho phép thêm sản phẩm vào giỏ hàng')`);
        
        await queryRunner.query(`INSERT INTO "feature_flags" ("key", "enabled", "group", "description") 
        VALUES ('enable_checkout', true, 'cart', 'Cho phép thanh toán giỏ hàng')`);
        
        await queryRunner.query(`INSERT INTO "feature_flags" ("key", "enabled", "group", "description") 
        VALUES ('enable_reviews', true, 'product', 'Cho phép đánh giá sản phẩm')`);
        
        await queryRunner.query(`INSERT INTO "feature_flags" ("key", "enabled", "group", "description") 
        VALUES ('enable_wishlist', true, 'user', 'Cho phép thêm sản phẩm vào danh sách yêu thích')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "feature_flags"`);
    }
} 