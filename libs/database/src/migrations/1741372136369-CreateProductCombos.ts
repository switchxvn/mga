import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductCombos1741372136369 implements MigrationInterface {
    name = 'CreateProductCombos1741372136369'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "product_combos" (
                "id" SERIAL NOT NULL,
                "main_product_id" integer NOT NULL,
                "combo_product_id" integer NOT NULL,
                "discountAmount" decimal(10,2),
                "discountPercent" decimal(5,2),
                "position" integer NOT NULL DEFAULT '0',
                "active" boolean NOT NULL DEFAULT true,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_product_combos" PRIMARY KEY ("id")
            )
        `);
        
        await queryRunner.query(`
            ALTER TABLE "product_combos" 
            ADD CONSTRAINT "FK_product_combos_main_product" 
            FOREIGN KEY ("main_product_id") REFERENCES "products"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        
        await queryRunner.query(`
            ALTER TABLE "product_combos" 
            ADD CONSTRAINT "FK_product_combos_combo_product" 
            FOREIGN KEY ("combo_product_id") REFERENCES "products"("id") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "product_combos" DROP CONSTRAINT "FK_product_combos_combo_product"
        `);
        
        await queryRunner.query(`
            ALTER TABLE "product_combos" DROP CONSTRAINT "FK_product_combos_main_product"
        `);
        
        await queryRunner.query(`
            DROP TABLE "product_combos"
        `);
    }
} 