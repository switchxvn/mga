import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTieredPricingToProducts1745000000034 implements MigrationInterface {
    name = 'AddTieredPricingToProducts1745000000034'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Tạo bảng cho giảm giá theo bậc cho sản phẩm
        await queryRunner.query(`
            CREATE TABLE "product_tier_discounts" (
                "id" SERIAL NOT NULL,
                "product_id" integer,
                "product_variant_id" integer,
                "min_quantity" integer NOT NULL,
                "discount_percent" decimal(5,2) NOT NULL,
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_product_tier_discounts" PRIMARY KEY ("id")
            )
        `);

        // Thêm ràng buộc khóa ngoại cho product_id
        await queryRunner.query(`
            ALTER TABLE "product_tier_discounts"
            ADD CONSTRAINT "FK_product_tier_discounts_product"
            FOREIGN KEY ("product_id")
            REFERENCES "products"("id")
            ON DELETE CASCADE
        `);

        // Thêm ràng buộc khóa ngoại cho product_variant_id
        await queryRunner.query(`
            ALTER TABLE "product_tier_discounts"
            ADD CONSTRAINT "FK_product_tier_discounts_product_variant"
            FOREIGN KEY ("product_variant_id")
            REFERENCES "product_variants"("id")
            ON DELETE CASCADE
        `);

        // Thêm ràng buộc để đảm bảo một trong hai trường product_id hoặc product_variant_id không null
        await queryRunner.query(`
            ALTER TABLE "product_tier_discounts"
            ADD CONSTRAINT "CHK_product_tier_discounts_product_id_or_variant_id"
            CHECK (
                ("product_id" IS NOT NULL AND "product_variant_id" IS NULL) OR
                ("product_id" IS NULL AND "product_variant_id" IS NOT NULL)
            )
        `);

        // Thêm ràng buộc để đảm bảo min_quantity > 0
        await queryRunner.query(`
            ALTER TABLE "product_tier_discounts"
            ADD CONSTRAINT "CHK_product_tier_discounts_min_quantity"
            CHECK ("min_quantity" > 0)
        `);

        // Thêm ràng buộc để đảm bảo discount_percent nằm trong khoảng 0-100
        await queryRunner.query(`
            ALTER TABLE "product_tier_discounts"
            ADD CONSTRAINT "CHK_product_tier_discounts_discount_percent"
            CHECK ("discount_percent" >= 0 AND "discount_percent" <= 100)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa ràng buộc khóa ngoại
        await queryRunner.query(`
            ALTER TABLE "product_tier_discounts"
            DROP CONSTRAINT "FK_product_tier_discounts_product_variant"
        `);

        await queryRunner.query(`
            ALTER TABLE "product_tier_discounts"
            DROP CONSTRAINT "FK_product_tier_discounts_product"
        `);

        // Xóa bảng
        await queryRunner.query(`
            DROP TABLE "product_tier_discounts"
        `);
    }
} 