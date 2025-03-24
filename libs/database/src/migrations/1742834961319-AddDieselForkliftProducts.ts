import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDieselForkliftProducts1742834961319 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, get the category ID for "xe-nang-dau"
    const categoryResult = await queryRunner.query(
      `SELECT c.id FROM categories c 
       INNER JOIN category_translations ct ON c.id = ct.category_id 
       WHERE ct.slug = 'xe-nang-dau' LIMIT 1`
    );

    if (!categoryResult || categoryResult.length === 0) {
      throw new Error('Category with slug "xe-nang-dau" not found');
    }

    const categoryId = categoryResult[0].id;

    // Array of products to insert
    const products = [
      {
        name: 'Xe Nâng Dầu MGA 2.5 Tấn',
        name_en: 'MGA 2.5 Ton Diesel Forklift',
        slug: 'xe-nang-dau-mga-2-5-tan',
        slug_en: 'mga-2-5-ton-diesel-forklift',
      },
      {
        name: 'Xe Nâng Dầu MGA 3.0 Tấn',
        name_en: 'MGA 3.0 Ton Diesel Forklift',
        slug: 'xe-nang-dau-mga-3-0-tan',
        slug_en: 'mga-3-0-ton-diesel-forklift',
      },
      {
        name: 'Xe Nâng Dầu MGA 3.5 Tấn',
        name_en: 'MGA 3.5 Ton Diesel Forklift',
        slug: 'xe-nang-dau-mga-3-5-tan',
        slug_en: 'mga-3-5-ton-diesel-forklift',
      },
      {
        name: 'Xe Nâng Dầu MGA 4.0 Tấn',
        name_en: 'MGA 4.0 Ton Diesel Forklift',
        slug: 'xe-nang-dau-mga-4-0-tan',
        slug_en: 'mga-4-0-ton-diesel-forklift',
      },
      {
        name: 'Xe Nâng Dầu MGA 4.5 Tấn',
        name_en: 'MGA 4.5 Ton Diesel Forklift',
        slug: 'xe-nang-dau-mga-4-5-tan',
        slug_en: 'mga-4-5-ton-diesel-forklift',
      },
      {
        name: 'Xe Nâng Dầu MGA 5.0 Tấn',
        name_en: 'MGA 5.0 Ton Diesel Forklift',
        slug: 'xe-nang-dau-mga-5-0-tan',
        slug_en: 'mga-5-0-ton-diesel-forklift',
      },
      {
        name: 'Xe Nâng Dầu MGA 7.0 Tấn',
        name_en: 'MGA 7.0 Ton Diesel Forklift',
        slug: 'xe-nang-dau-mga-7-0-tan',
        slug_en: 'mga-7-0-ton-diesel-forklift',
      },
      {
        name: 'Xe Nâng Dầu MGA 10 Tấn',
        name_en: 'MGA 10 Ton Diesel Forklift',
        slug: 'xe-nang-dau-mga-10-tan',
        slug_en: 'mga-10-ton-diesel-forklift',
      },
      {
        name: 'Xe Nâng Dầu MGA 15 Tấn',
        name_en: 'MGA 15 Ton Diesel Forklift',
        slug: 'xe-nang-dau-mga-15-tan',
        slug_en: 'mga-15-ton-diesel-forklift',
      },
      {
        name: 'Xe Nâng Dầu MGA 16 Tấn',
        name_en: 'MGA 16 Ton Diesel Forklift',
        slug: 'xe-nang-dau-mga-16-tan',
        slug_en: 'mga-16-ton-diesel-forklift',
      },
      {
        name: 'Xe Nâng Dầu MGA 18 Tấn',
        name_en: 'MGA 18 Ton Diesel Forklift',
        slug: 'xe-nang-dau-mga-18-tan',
        slug_en: 'mga-18-ton-diesel-forklift',
      },
    ];

    // Insert products and their translations
    for (const product of products) {
      // Insert product
      const result = await queryRunner.query(
        `INSERT INTO products (price, published, quantity, thumbnail, created_at, updated_at)
         VALUES (NULL, true, 0, $1, NOW(), NOW())
         RETURNING id`,
        [`https://s3mga.sgp1.digitaloceanspaces.com/products/${product.slug}.jpg`]
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
          `${product.name} là sản phẩm xe nâng dầu chất lượng cao của MGA. Với thiết kế hiện đại và khả năng nâng tải ${product.name.toLowerCase().includes('tấn') ? product.name.split(' ').pop() : ''}, đây là lựa chọn lý tưởng cho các công việc vận chuyển và nâng hạ hàng hóa trong công nghiệp và kho bãi.`,
          `Xe nâng dầu MGA với tải trọng ${product.name.toLowerCase().includes('tấn') ? product.name.split(' ').pop() : ''} - Giải pháp vận chuyển hàng hóa hiệu quả và an toàn.`,
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
          `The ${product.name_en} is a high-quality diesel forklift from MGA. With its modern design and ${product.name_en.includes('Ton') ? product.name_en.split(' ')[0] : ''} lifting capacity, it's an ideal choice for industrial and warehouse material handling operations.`,
          `MGA diesel forklift with ${product.name_en.includes('Ton') ? product.name_en.split(' ')[0] : ''} lifting capacity - Efficient and safe material handling solution.`,
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
    // Get all product IDs that belong to the diesel forklift category
    const categoryResult = await queryRunner.query(
      `SELECT c.id FROM categories c 
       INNER JOIN category_translations ct ON c.id = ct.category_id 
       WHERE ct.slug = 'xe-nang-dau' LIMIT 1`
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