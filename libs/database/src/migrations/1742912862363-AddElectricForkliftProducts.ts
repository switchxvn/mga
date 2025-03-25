import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddElectricForkliftProducts1742912862363 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, get the category ID for "xe-nang-dien"
    const categoryResult = await queryRunner.query(
      `SELECT c.id FROM categories c 
       INNER JOIN category_translations ct ON c.id = ct.category_id 
       WHERE ct.slug = 'xe-nang-dien' LIMIT 1`
    );

    if (!categoryResult || categoryResult.length === 0) {
      throw new Error('Category with slug "xe-nang-dien" not found');
    }

    const categoryId = categoryResult[0].id;

    // Array of products to insert
    const products = [
      {
        name: 'Xe Nâng Điện Đứng Lái MGA 1.0 Tấn',
        name_en: 'MGA 1.0 Ton Stand-up Electric Forklift',
        slug: 'xe-nang-dien-dung-lai-mga-1-0-tan',
        slug_en: 'mga-1-0-ton-stand-up-electric-forklift',
      },
      {
        name: 'Xe Nâng Điện Đứng Lái MGA 1.5 Tấn',
        name_en: 'MGA 1.5 Ton Stand-up Electric Forklift',
        slug: 'xe-nang-dien-dung-lai-mga-1-5-tan',
        slug_en: 'mga-1-5-ton-stand-up-electric-forklift',
      },
      {
        name: 'Xe Nâng Điện Đứng Lái MGA 2.0 Tấn',
        name_en: 'MGA 2.0 Ton Stand-up Electric Forklift',
        slug: 'xe-nang-dien-dung-lai-mga-2-0-tan',
        slug_en: 'mga-2-0-ton-stand-up-electric-forklift',
      },
      {
        name: 'Xe Nâng Điện Đứng Lái MGA 2.5 Tấn',
        name_en: 'MGA 2.5 Ton Stand-up Electric Forklift',
        slug: 'xe-nang-dien-dung-lai-mga-2-5-tan',
        slug_en: 'mga-2-5-ton-stand-up-electric-forklift',
      },
      {
        name: 'Xe Nâng Điện Đứng Lái MGA 3.0 Tấn',
        name_en: 'MGA 3.0 Ton Stand-up Electric Forklift',
        slug: 'xe-nang-dien-dung-lai-mga-3-0-tan',
        slug_en: 'mga-3-0-ton-stand-up-electric-forklift',
      },
      {
        name: 'Xe Nâng Điện Tay Thấp MGA 1.5 Tấn',
        name_en: 'MGA 1.5 Ton Low Electric Pallet Truck',
        slug: 'xe-nang-dien-tay-thap-mga-1-5-tan',
        slug_en: 'mga-1-5-ton-low-electric-pallet-truck',
      },
      {
        name: 'Xe Nâng Điện Stacker',
        name_en: 'Electric Stacker',
        slug: 'xe-nang-dien-stacker',
        slug_en: 'electric-stacker',
      },
      {
        name: 'Xe Nâng Điện MGA 1.5 Tấn',
        name_en: 'MGA 1.5 Ton Electric Forklift',
        slug: 'xe-nang-dien-mga-1-5-tan',
        slug_en: 'mga-1-5-ton-electric-forklift',
      },
      {
        name: 'Xe Nâng Điện MGA 1.8 Tấn',
        name_en: 'MGA 1.8 Ton Electric Forklift',
        slug: 'xe-nang-dien-mga-1-8-tan',
        slug_en: 'mga-1-8-ton-electric-forklift',
      },
      {
        name: 'Xe Nâng Điện MGA 2.0 Tấn',
        name_en: 'MGA 2.0 Ton Electric Forklift',
        slug: 'xe-nang-dien-mga-2-0-tan',
        slug_en: 'mga-2-0-ton-electric-forklift',
      },
      {
        name: 'Xe Nâng Điện MGA 2.5 Tấn',
        name_en: 'MGA 2.5 Ton Electric Forklift',
        slug: 'xe-nang-dien-mga-2-5-tan',
        slug_en: 'mga-2-5-ton-electric-forklift',
      },
      {
        name: 'Xe Nâng Điện MGA 3.0 Tấn',
        name_en: 'MGA 3.0 Ton Electric Forklift',
        slug: 'xe-nang-dien-mga-3-0-tan',
        slug_en: 'mga-3-0-ton-electric-forklift',
      },
      {
        name: 'Xe Nâng Điện MGA 3.5 Tấn',
        name_en: 'MGA 3.5 Ton Electric Forklift',
        slug: 'xe-nang-dien-mga-3-5-tan',
        slug_en: 'mga-3-5-ton-electric-forklift',
      },
      {
        name: 'Xe Nâng Điện Ngồi Lái MGA 1.0 Tấn',
        name_en: 'MGA 1.0 Ton Sit-down Electric Forklift',
        slug: 'xe-nang-dien-ngoi-lai-mga-1-0-tan',
        slug_en: 'mga-1-0-ton-sit-down-electric-forklift',
      },
      {
        name: 'Xe Nâng Điện Ngồi Lái MGA 1.5 Tấn',
        name_en: 'MGA 1.5 Ton Sit-down Electric Forklift',
        slug: 'xe-nang-dien-ngoi-lai-mga-1-5-tan',
        slug_en: 'mga-1-5-ton-sit-down-electric-forklift',
      }
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
          `${product.name} là sản phẩm xe nâng điện chất lượng cao của MGA. Với thiết kế hiện đại và khả năng nâng tải ${product.name.toLowerCase().includes('tấn') ? product.name.split(' ').pop() : ''}, đây là lựa chọn lý tưởng cho các công việc vận chuyển và nâng hạ hàng hóa trong công nghiệp và kho bãi.`,
          `Xe nâng điện MGA với tải trọng ${product.name.toLowerCase().includes('tấn') ? product.name.split(' ').pop() : ''} - Giải pháp vận chuyển hàng hóa hiệu quả và thân thiện với môi trường.`,
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
          `The ${product.name_en} is a high-quality electric forklift from MGA. With its modern design and ${product.name_en.includes('Ton') ? product.name_en.split(' ')[0] : ''} lifting capacity, it's an ideal choice for industrial and warehouse material handling operations.`,
          `MGA electric forklift with ${product.name_en.includes('Ton') ? product.name_en.split(' ')[0] : ''} lifting capacity - Efficient and environmentally friendly material handling solution.`,
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
    // Get all product IDs that belong to the electric forklift category
    const categoryResult = await queryRunner.query(
      `SELECT c.id FROM categories c 
       INNER JOIN category_translations ct ON c.id = ct.category_id 
       WHERE ct.slug = 'xe-nang-dien' LIMIT 1`
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