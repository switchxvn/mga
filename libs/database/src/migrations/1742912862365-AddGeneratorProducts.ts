import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGeneratorProducts1742912862365 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, get the category ID for "may-phat-dien"
    const categoryResult = await queryRunner.query(
      `SELECT c.id FROM categories c 
       INNER JOIN category_translations ct ON c.id = ct.category_id 
       WHERE ct.slug = 'may-phat-dien' LIMIT 1`
    );

    if (!categoryResult || categoryResult.length === 0) {
      throw new Error('Category with slug "may-phat-dien" not found');
    }

    const categoryId = categoryResult[0].id;

    // Array of products to insert
    const products = [
      {
        name: 'Máy Phát Điện MGA 33KVA',
        name_en: 'MGA 33KVA Generator',
        slug: 'may-phat-dien-mga-33kva',
        slug_en: 'mga-33kva-generator',
        power: '33KVA'
      },
      {
        name: 'Máy Phát Điện MGA 40KVA',
        name_en: 'MGA 40KVA Generator',
        slug: 'may-phat-dien-mga-40kva',
        slug_en: 'mga-40kva-generator',
        power: '40KVA'
      },
      {
        name: 'Máy Phát Điện MGA 70KVA',
        name_en: 'MGA 70KVA Generator',
        slug: 'may-phat-dien-mga-70kva',
        slug_en: 'mga-70kva-generator',
        power: '70KVA'
      },
      {
        name: 'Máy Phát Điện MGA 95KVA',
        name_en: 'MGA 95KVA Generator',
        slug: 'may-phat-dien-mga-95kva',
        slug_en: 'mga-95kva-generator',
        power: '95KVA'
      },
      {
        name: 'Máy Phát Điện MGA 110KVA',
        name_en: 'MGA 110KVA Generator',
        slug: 'may-phat-dien-mga-110kva',
        slug_en: 'mga-110kva-generator',
        power: '110KVA'
      },
      {
        name: 'Máy Phát Điện MGA 138KVA',
        name_en: 'MGA 138KVA Generator',
        slug: 'may-phat-dien-mga-138kva',
        slug_en: 'mga-138kva-generator',
        power: '138KVA'
      },
      {
        name: 'Máy Phát Điện MGA 145KVA',
        name_en: 'MGA 145KVA Generator',
        slug: 'may-phat-dien-mga-145kva',
        slug_en: 'mga-145kva-generator',
        power: '145KVA'
      },
      {
        name: 'Máy Phát Điện MGA 198KVA',
        name_en: 'MGA 198KVA Generator',
        slug: 'may-phat-dien-mga-198kva',
        slug_en: 'mga-198kva-generator',
        power: '198KVA'
      },
      {
        name: 'Máy Phát Điện MGA 220KVA',
        name_en: 'MGA 220KVA Generator',
        slug: 'may-phat-dien-mga-220kva',
        slug_en: 'mga-220kva-generator',
        power: '220KVA'
      },
      {
        name: 'Máy Phát Điện MGA 265KVA',
        name_en: 'MGA 265KVA Generator',
        slug: 'may-phat-dien-mga-265kva',
        slug_en: 'mga-265kva-generator',
        power: '265KVA'
      },
      {
        name: 'Máy Phát Điện MGA 275KVA',
        name_en: 'MGA 275KVA Generator',
        slug: 'may-phat-dien-mga-275kva',
        slug_en: 'mga-275kva-generator',
        power: '275KVA'
      },
      {
        name: 'Máy Phát Điện MGA 350KVA',
        name_en: 'MGA 350KVA Generator',
        slug: 'may-phat-dien-mga-350kva',
        slug_en: 'mga-350kva-generator',
        power: '350KVA'
      },
      {
        name: 'Máy Phát Điện MGA 375KVA',
        name_en: 'MGA 375KVA Generator',
        slug: 'may-phat-dien-mga-375kva',
        slug_en: 'mga-375kva-generator',
        power: '375KVA'
      },
      {
        name: 'Máy Phát Điện MGA 388KVA',
        name_en: 'MGA 388KVA Generator',
        slug: 'may-phat-dien-mga-388kva',
        slug_en: 'mga-388kva-generator',
        power: '388KVA'
      },
      {
        name: 'Máy Phát Điện MGA 500KVA',
        name_en: 'MGA 500KVA Generator',
        slug: 'may-phat-dien-mga-500kva',
        slug_en: 'mga-500kva-generator',
        power: '500KVA'
      },
      {
        name: 'Máy Phát Điện MGA 550KVA',
        name_en: 'MGA 550KVA Generator',
        slug: 'may-phat-dien-mga-550kva',
        slug_en: 'mga-550kva-generator',
        power: '550KVA'
      },
      {
        name: 'Máy Phát Điện MGA 600KVA',
        name_en: 'MGA 600KVA Generator',
        slug: 'may-phat-dien-mga-600kva',
        slug_en: 'mga-600kva-generator',
        power: '600KVA'
      },
      {
        name: 'Máy Phát Điện MGA 650KVA',
        name_en: 'MGA 650KVA Generator',
        slug: 'may-phat-dien-mga-650kva',
        slug_en: 'mga-650kva-generator',
        power: '650KVA'
      },
      {
        name: 'Máy Phát Điện MGA 688KVA',
        name_en: 'MGA 688KVA Generator',
        slug: 'may-phat-dien-mga-688kva',
        slug_en: 'mga-688kva-generator',
        power: '688KVA'
      },
      {
        name: 'Máy Phát Điện MGA 1250KVA',
        name_en: 'MGA 1250KVA Generator',
        slug: 'may-phat-dien-mga-1250kva',
        slug_en: 'mga-1250kva-generator',
        power: '1250KVA'
      },
      {
        name: 'Máy Phát Điện MGA 2500KVA',
        name_en: 'MGA 2500KVA Generator',
        slug: 'may-phat-dien-mga-2500kva',
        slug_en: 'mga-2500kva-generator',
        power: '2500KVA'
      }
    ];

    // Insert products and their translations
    for (const product of products) {
      // Insert product
      const result = await queryRunner.query(
        `INSERT INTO products (sku, price, published, quantity, thumbnail, created_at, updated_at)
         VALUES ($1, NULL, true, 0, $2, NOW(), NOW())
         RETURNING id`,
        [
          `MGA-${product.power}`,
          `https://s3mga.sgp1.digitaloceanspaces.com/products/${product.slug}.jpg`
        ]
      );

      const productId = result[0].id;

      // Insert Vietnamese translation
      await queryRunner.query(
        `INSERT INTO product_translations 
         (product_id, locale, title, slug, content, short_description, created_at, updated_at)
         VALUES ($1, 'vi', $2, $3, $4, $5, NOW(), NOW())`,
        [
          productId,
          product.name,
          product.slug,
          `${product.name} là sản phẩm máy phát điện công suất cao của MGA. Với công suất ${product.power}, máy phát điện này đáp ứng tốt nhu cầu cung cấp điện trong công nghiệp và dân dụng.`,
          `Máy phát điện MGA công suất ${product.power} - Giải pháp cung cấp điện hiệu quả và ổn định cho doanh nghiệp.`,
        ]
      );

      // Insert English translation
      await queryRunner.query(
        `INSERT INTO product_translations 
         (product_id, locale, title, slug, content, short_description, created_at, updated_at)
         VALUES ($1, 'en', $2, $3, $4, $5, NOW(), NOW())`,
        [
          productId,
          product.name_en,
          product.slug_en,
          `The ${product.name_en} is a high-performance generator from MGA. With ${product.power} power capacity, this generator effectively meets industrial and residential power supply needs.`,
          `MGA generator with ${product.power} power - Efficient and stable power supply solution for businesses.`,
        ]
      );

      // Link product to category
      await queryRunner.query(
        `INSERT INTO product_categories (product_id, category_id)
         VALUES ($1, $2)`,
        [productId, categoryId]
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Get all product IDs that belong to the generator category
    const categoryResult = await queryRunner.query(
      `SELECT c.id FROM categories c 
       INNER JOIN category_translations ct ON c.id = ct.category_id 
       WHERE ct.slug = 'may-phat-dien' LIMIT 1`
    );

    if (categoryResult && categoryResult.length > 0) {
      const categoryId = categoryResult[0].id;

      // Get product IDs
      const productIds = await queryRunner.query(
        `SELECT product_id FROM product_categories WHERE category_id = $1`,
        [categoryId]
      );

      if (productIds && productIds.length > 0) {
        const ids = productIds.map((p: { product_id: number }) => p.product_id);

        // Delete product translations
        await queryRunner.query(
          `DELETE FROM product_translations WHERE product_id = ANY($1)`,
          [ids]
        );

        // Delete product category relations
        await queryRunner.query(
          `DELETE FROM product_categories WHERE product_id = ANY($1)`,
          [ids]
        );

        // Delete products
        await queryRunner.query(
          `DELETE FROM products WHERE id = ANY($1)`,
          [ids]
        );
      }
    }
  }
} 