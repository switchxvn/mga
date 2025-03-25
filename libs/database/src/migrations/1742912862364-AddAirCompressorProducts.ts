import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAirCompressorProducts1742912862364 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, get the category ID for "may-nen-khi"
    const categoryResult = await queryRunner.query(
      `SELECT c.id FROM categories c 
       INNER JOIN category_translations ct ON c.id = ct.category_id 
       WHERE ct.slug = 'may-nen-khi' LIMIT 1`
    );

    if (!categoryResult || categoryResult.length === 0) {
      throw new Error('Category with slug "may-nen-khi" not found');
    }

    const categoryId = categoryResult[0].id;

    // Array of products to insert
    const products = [
      {
        name: 'Máy Nén Khí MGA 7.5HP',
        name_en: 'MGA 7.5HP Air Compressor',
        slug: 'may-nen-khi-mga-7-5hp',
        slug_en: 'mga-7-5hp-air-compressor',
        power: '7.5HP'
      },
      {
        name: 'Máy Nén Khí MGA 10HP',
        name_en: 'MGA 10HP Air Compressor',
        slug: 'may-nen-khi-mga-10hp',
        slug_en: 'mga-10hp-air-compressor',
        power: '10HP'
      },
      {
        name: 'Máy Nén Khí MGA 15HP',
        name_en: 'MGA 15HP Air Compressor',
        slug: 'may-nen-khi-mga-15hp',
        slug_en: 'mga-15hp-air-compressor',
        power: '15HP'
      },
      {
        name: 'Máy Nén Khí MGA 20HP',
        name_en: 'MGA 20HP Air Compressor',
        slug: 'may-nen-khi-mga-20hp',
        slug_en: 'mga-20hp-air-compressor',
        power: '20HP'
      },
      {
        name: 'Máy Nén Khí MGA 25HP',
        name_en: 'MGA 25HP Air Compressor',
        slug: 'may-nen-khi-mga-25hp',
        slug_en: 'mga-25hp-air-compressor',
        power: '25HP'
      },
      {
        name: 'Máy Nén Khí MGA 30HP',
        name_en: 'MGA 30HP Air Compressor',
        slug: 'may-nen-khi-mga-30hp',
        slug_en: 'mga-30hp-air-compressor',
        power: '30HP'
      },
      {
        name: 'Máy Nén Khí MGA 40HP',
        name_en: 'MGA 40HP Air Compressor',
        slug: 'may-nen-khi-mga-40hp',
        slug_en: 'mga-40hp-air-compressor',
        power: '40HP'
      },
      {
        name: 'Máy Nén Khí MGA 50HP',
        name_en: 'MGA 50HP Air Compressor',
        slug: 'may-nen-khi-mga-50hp',
        slug_en: 'mga-50hp-air-compressor',
        power: '50HP'
      },
      {
        name: 'Máy Nén Khí MGA 60HP',
        name_en: 'MGA 60HP Air Compressor',
        slug: 'may-nen-khi-mga-60hp',
        slug_en: 'mga-60hp-air-compressor',
        power: '60HP'
      },
      {
        name: 'Máy Nén Khí MGA 75HP',
        name_en: 'MGA 75HP Air Compressor',
        slug: 'may-nen-khi-mga-75hp',
        slug_en: 'mga-75hp-air-compressor',
        power: '75HP'
      },
      {
        name: 'Máy Nén Khí MGA 100HP',
        name_en: 'MGA 100HP Air Compressor',
        slug: 'may-nen-khi-mga-100hp',
        slug_en: 'mga-100hp-air-compressor',
        power: '100HP'
      },
      {
        name: 'Máy Nén Khí MGA 125HP',
        name_en: 'MGA 125HP Air Compressor',
        slug: 'may-nen-khi-mga-125hp',
        slug_en: 'mga-125hp-air-compressor',
        power: '125HP'
      },
      {
        name: 'Máy Nén Khí MGA 150HP',
        name_en: 'MGA 150HP Air Compressor',
        slug: 'may-nen-khi-mga-150hp',
        slug_en: 'mga-150hp-air-compressor',
        power: '150HP'
      },
      {
        name: 'Máy Nén Khí MGA 180HP',
        name_en: 'MGA 180HP Air Compressor',
        slug: 'may-nen-khi-mga-180hp',
        slug_en: 'mga-180hp-air-compressor',
        power: '180HP'
      },
      {
        name: 'Máy Nén Khí MGA 220HP',
        name_en: 'MGA 220HP Air Compressor',
        slug: 'may-nen-khi-mga-220hp',
        slug_en: 'mga-220hp-air-compressor',
        power: '220HP'
      },
      {
        name: 'Máy Nén Khí MGA 250HP',
        name_en: 'MGA 250HP Air Compressor',
        slug: 'may-nen-khi-mga-250hp',
        slug_en: 'mga-250hp-air-compressor',
        power: '250HP'
      },
      {
        name: 'Máy Nén Khí MGA 270HP',
        name_en: 'MGA 270HP Air Compressor',
        slug: 'may-nen-khi-mga-270hp',
        slug_en: 'mga-270hp-air-compressor',
        power: '270HP'
      },
      {
        name: 'Máy Nén Khí MGA 300HP',
        name_en: 'MGA 300HP Air Compressor',
        slug: 'may-nen-khi-mga-300hp',
        slug_en: 'mga-300hp-air-compressor',
        power: '300HP'
      },
      {
        name: 'Máy Nén Khí MGA 340HP',
        name_en: 'MGA 340HP Air Compressor',
        slug: 'may-nen-khi-mga-340hp',
        slug_en: 'mga-340hp-air-compressor',
        power: '340HP'
      },
      {
        name: 'Máy Nén Khí MGA 375HP',
        name_en: 'MGA 375HP Air Compressor',
        slug: 'may-nen-khi-mga-375hp',
        slug_en: 'mga-375hp-air-compressor',
        power: '375HP'
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
          `${product.name} là sản phẩm máy nén khí công suất cao của MGA. Với công suất ${product.power}, máy nén khí này đáp ứng tốt nhu cầu sử dụng khí nén trong công nghiệp và sản xuất.`,
          `Máy nén khí MGA công suất ${product.power} - Giải pháp cung cấp khí nén hiệu quả và ổn định cho doanh nghiệp.`,
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
          `The ${product.name_en} is a high-performance air compressor from MGA. With ${product.power} power capacity, this air compressor effectively meets industrial and manufacturing compressed air needs.`,
          `MGA air compressor with ${product.power} power - Efficient and stable compressed air solution for businesses.`,
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
    // Get all product IDs that belong to the air compressor category
    const categoryResult = await queryRunner.query(
      `SELECT c.id FROM categories c 
       INNER JOIN category_translations ct ON c.id = ct.category_id 
       WHERE ct.slug = 'may-nen-khi' LIMIT 1`
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