import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateProductCategoriesSections1742637124945 implements MigrationInterface {
    name = 'UpdateProductCategoriesSections1742637124945'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Deactivate old product_categories section
        await queryRunner.query(`
            UPDATE theme_sections 
            SET is_active = false 
            WHERE type = 'product_categories'
        `);

        // Insert new styled product categories section
        await queryRunner.query(`
            INSERT INTO theme_sections (
                type,
                title,
                "order",
                page_type,
                component_name,
                settings,
                is_active,
                theme_id
            )
            SELECT 
                'styled_product_categories',
                'Danh mục sản phẩm',
                "order",
                page_type,
                'StyledProductCategoriesSection',
                jsonb_set(
                    settings,
                    '{displayMode}',
                    '"grid"'
                ),
                true,
                theme_id
            FROM theme_sections
            WHERE type = 'product_categories'
            LIMIT 1
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove new styled product categories section
        await queryRunner.query(`
            DELETE FROM theme_sections 
            WHERE type = 'styled_product_categories'
        `);

        // Reactivate old product_categories section
        await queryRunner.query(`
            UPDATE theme_sections 
            SET is_active = true 
            WHERE type = 'product_categories'
        `);
    }
} 