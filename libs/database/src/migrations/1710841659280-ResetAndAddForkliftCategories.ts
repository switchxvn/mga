import { MigrationInterface, QueryRunner } from 'typeorm';
import { CategoryType } from '../../../../libs/shared/src/types/category.type';
export class ResetAndAddForkliftCategories1710841659280 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, delete all existing products and their relations
    await queryRunner.query(`DELETE FROM product_categories`);
    await queryRunner.query(`DELETE FROM product_translations`);
    await queryRunner.query(`DELETE FROM products`);

    // Then delete all categories
    await queryRunner.query(`DELETE FROM categories`);

    // Reset sequences
    await queryRunner.query(`ALTER SEQUENCE categories_id_seq RESTART WITH 1`);
    await queryRunner.query(`ALTER SEQUENCE products_id_seq RESTART WITH 1`);
    await queryRunner.query(`ALTER SEQUENCE product_translations_id_seq RESTART WITH 1`);

    // Insert new categories
    const categories = [
      {
        name: 'Diesel Forklift',
        slug: 'xe-nang-dau',
        description: 'Các loại xe nâng dầu từ 2.5 tấn đến 18 tấn',
        active: true,
        is_featured: true,
        category_type: CategoryType.PRODUCT,
        meta_title: 'Xe Nâng Dầu | Forklift Solutions',
        meta_description: 'Xe nâng dầu chất lượng cao, đa dạng tải trọng từ 2.5 đến 18 tấn',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Electric Forklift',
        slug: 'xe-nang-dien',
        description: 'Xe nâng điện đứng lái MGA từ 1.0 đến 3.0 tấn',
        active: true,
        is_featured: true,
        category_type: CategoryType.PRODUCT,
        meta_title: 'Xe Nâng Điện | Forklift Solutions',
        meta_description: 'Xe nâng điện đứng lái MGA chất lượng cao, tải trọng từ 1.0 đến 3.0 tấn',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Air Compressor',
        slug: 'may-nen-khi',
        description: 'Các loại máy nén khí công nghiệp',
        active: true,
        is_featured: true,
        category_type: CategoryType.PRODUCT,
        meta_title: 'Máy Nén Khí | Industrial Solutions',
        meta_description: 'Máy nén khí công nghiệp chất lượng cao',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Generator',
        slug: 'may-phat-dien',
        description: 'Các loại máy phát điện công nghiệp',
        active: true,
        is_featured: true,
        category_type: CategoryType.PRODUCT,
        meta_title: 'Máy Phát Điện | Power Solutions',
        meta_description: 'Máy phát điện công nghiệp chất lượng cao',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    for (const category of categories) {
      await queryRunner.query(`
        INSERT INTO categories (
          name, slug, description, active, is_featured, category_type,
          meta_title, meta_description, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        )
      `, [
        category.name,
        category.slug,
        category.description,
        category.active,
        category.is_featured,
        category.category_type,
        category.meta_title,
        category.meta_description,
        category.created_at,
        category.updated_at
      ]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM categories WHERE slug IN ('xe-nang-dau', 'xe-nang-dien', 'may-nen-khi', 'may-phat-dien')`);
  }
} 