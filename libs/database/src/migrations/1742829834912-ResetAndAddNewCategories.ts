import { MigrationInterface, QueryRunner } from 'typeorm';

export class ResetAndAddNewCategories1742829834912 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Delete existing product categories and their translations
    await queryRunner.query(`
      DELETE FROM "category_translations"
      WHERE "category_id" IN (
        SELECT id FROM categories
        WHERE category_type = 'product'
      )
    `);

    await queryRunner.query(`
      DELETE FROM "product_categories"
      WHERE "category_id" IN (
        SELECT id FROM categories
        WHERE category_type = 'product'
      )
    `);

    await queryRunner.query(`
      DELETE FROM categories
      WHERE category_type = 'product'
    `);

    // 2. Add new categories
    const categories = [
      {
        name: 'Xe nâng dầu',
        nameEn: 'Diesel Forklift',
        nameKo: '디젤 지게차',
        slug: 'xe-nang-dau',
        slugEn: 'diesel-forklift',
        slugKo: 'dijel-jigechar'
      },
      {
        name: 'Xe nâng điện',
        nameEn: 'Electric Forklift',
        nameKo: '전동 지게차',
        slug: 'xe-nang-dien',
        slugEn: 'electric-forklift',
        slugKo: 'jeondong-jigechar'
      },
      {
        name: 'Máy nén khí',
        nameEn: 'Air Compressor',
        nameKo: '공기 압축기',
        slug: 'may-nen-khi',
        slugEn: 'air-compressor',
        slugKo: 'gonggi-apchukgi'
      },
      {
        name: 'Máy phát điện',
        nameEn: 'Generator',
        nameKo: '발전기',
        slug: 'may-phat-dien',
        slugEn: 'generator',
        slugKo: 'baljeongi'
      }
    ];

    for (const category of categories) {
      // Insert category
      const result = await queryRunner.query(`
        INSERT INTO categories (category_type, "created_at", "updated_at")
        VALUES ('product', NOW(), NOW())
        RETURNING id
      `);
      
      const categoryId = result[0].id;

      // Insert translations for Vietnamese
      await queryRunner.query(`
        INSERT INTO category_translations (
          name, slug, locale, "category_id", "created_at", "updated_at"
        )
        VALUES ($1, $2, 'vi', $3, NOW(), NOW())
      `, [category.name, category.slug, categoryId]);

      // Insert translations for English
      await queryRunner.query(`
        INSERT INTO category_translations (
          name, slug, locale, "category_id", "created_at", "updated_at"
        )
        VALUES ($1, $2, 'en', $3, NOW(), NOW())
      `, [category.nameEn, category.slugEn, categoryId]);

      // Insert translations for Korean
      await queryRunner.query(`
        INSERT INTO category_translations (
          name, slug, locale, "category_id", "created_at", "updated_at"
        )
        VALUES ($1, $2, 'ko', $3, NOW(), NOW())
      `, [category.nameKo, category.slugKo, categoryId]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete the categories we added
    await queryRunner.query(`
      DELETE FROM category_translations
      WHERE "category_id" IN (
        SELECT id FROM categories
        WHERE category_type = 'product'
      )
    `);

    await queryRunner.query(`
      DELETE FROM categories
      WHERE category_type = 'product'
    `);
  }
} 