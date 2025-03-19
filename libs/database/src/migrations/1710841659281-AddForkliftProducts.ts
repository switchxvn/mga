import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForkliftProducts1710841659281 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Diesel Forklifts
    const dieselForklifts = [
      { capacity: 2.5, model: 'FD25T' },
      { capacity: 3.0, model: 'FD30T' },
      { capacity: 5.0, model: 'FD50T' },
      { capacity: 7.0, model: 'FD70T' },
      { capacity: 10.0, model: 'FD100T' },
      { capacity: 15.0, model: 'FD150T' },
      { capacity: 18.0, model: 'FD180T' },
    ];

    // Electric Forklifts
    const electricForklifts = [
      { capacity: 1.0, model: 'MGA10E' },
      { capacity: 1.5, model: 'MGA15E' },
      { capacity: 2.0, model: 'MGA20E' },
      { capacity: 2.5, model: 'MGA25E' },
      { capacity: 3.0, model: 'MGA30E' },
    ];

    // Insert Diesel Forklifts
    for (const forklift of dieselForklifts) {
      // Insert product
      const result = await queryRunner.query(`
        INSERT INTO products (
          sku, price, compare_price, published, quantity, is_featured, is_new, is_sale,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        ) RETURNING id
      `, [
        forklift.model,
        null, // price
        null, // compare_price
        true, // published
        0, // quantity
        true, // is_featured
        true, // is_new
        false, // is_sale
        new Date(),
        new Date()
      ]);

      const productId = result[0].id;

      // Insert translations
      await queryRunner.query(`
        INSERT INTO product_translations (
          product_id, locale, title, content, short_description, slug,
          meta_title, meta_description, created_at, updated_at
        ) VALUES
        ($1, 'vi', $2, $3, $4, $5, $6, $7, $8, $9),
        ($1, 'en', $10, $11, $12, $13, $14, $15, $16, $17)
      `, [
        productId,
        // Vietnamese
        `Xe nâng dầu ${forklift.capacity} tấn ${forklift.model}`,
        `Xe nâng dầu ${forklift.capacity} tấn ${forklift.model} là sự lựa chọn hoàn hảo cho các công việc nâng hạ hàng hóa nặng.`,
        `Xe nâng dầu công suất ${forklift.capacity} tấn, model ${forklift.model}, thiết kế bền bỉ, vận hành ổn định.`,
        `xe-nang-dau-${forklift.capacity}-tan-${forklift.model.toLowerCase()}`,
        `Xe Nâng Dầu ${forklift.capacity} Tấn ${forklift.model} | Forklift Solutions`,
        `Xe nâng dầu ${forklift.capacity} tấn ${forklift.model} chất lượng cao, giá tốt nhất thị trường`,
        new Date(),
        new Date(),
        // English
        `${forklift.capacity}T Diesel Forklift ${forklift.model}`,
        `The ${forklift.capacity}T Diesel Forklift ${forklift.model} is the perfect choice for heavy lifting operations.`,
        `${forklift.capacity} ton diesel forklift, model ${forklift.model}, durable design, stable operation.`,
        `${forklift.capacity}t-diesel-forklift-${forklift.model.toLowerCase()}`,
        `${forklift.capacity}T Diesel Forklift ${forklift.model} | Forklift Solutions`,
        `High quality ${forklift.capacity}T diesel forklift ${forklift.model}, best price in the market`,
        new Date(),
        new Date()
      ]);

      // Link to diesel category
      await queryRunner.query(`
        INSERT INTO product_categories (product_id, category_id)
        SELECT $1, id FROM categories WHERE slug = 'xe-nang-dau'
      `, [productId]);
    }

    // Insert Electric Forklifts
    for (const forklift of electricForklifts) {
      // Insert product
      const result = await queryRunner.query(`
        INSERT INTO products (
          sku, price, compare_price, published, quantity, is_featured, is_new, is_sale,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        ) RETURNING id
      `, [
        forklift.model,
        null, // price
        null, // compare_price
        true, // published
        0, // quantity
        true, // is_featured
        true, // is_new
        false, // is_sale
        new Date(),
        new Date()
      ]);

      const productId = result[0].id;

      // Insert translations
      await queryRunner.query(`
        INSERT INTO product_translations (
          product_id, locale, title, content, short_description, slug,
          meta_title, meta_description, created_at, updated_at
        ) VALUES
        ($1, 'vi', $2, $3, $4, $5, $6, $7, $8, $9),
        ($1, 'en', $10, $11, $12, $13, $14, $15, $16, $17)
      `, [
        productId,
        // Vietnamese
        `Xe nâng điện đứng lái MGA ${forklift.capacity} tấn ${forklift.model}`,
        `Xe nâng điện đứng lái MGA ${forklift.capacity} tấn ${forklift.model} là giải pháp hiệu quả cho các kho hàng hiện đại.`,
        `Xe nâng điện đứng lái công suất ${forklift.capacity} tấn, model ${forklift.model}, vận hành êm ái, thân thiện môi trường.`,
        `xe-nang-dien-dung-lai-mga-${forklift.capacity}-tan-${forklift.model.toLowerCase()}`,
        `Xe Nâng Điện Đứng Lái MGA ${forklift.capacity} Tấn ${forklift.model} | Forklift Solutions`,
        `Xe nâng điện đứng lái MGA ${forklift.capacity} tấn ${forklift.model} chất lượng cao, tiết kiệm năng lượng`,
        new Date(),
        new Date(),
        // English
        `${forklift.capacity}T MGA Stand-up Electric Forklift ${forklift.model}`,
        `The ${forklift.capacity}T MGA Stand-up Electric Forklift ${forklift.model} is an efficient solution for modern warehouses.`,
        `${forklift.capacity} ton stand-up electric forklift, model ${forklift.model}, smooth operation, eco-friendly.`,
        `${forklift.capacity}t-mga-stand-up-electric-forklift-${forklift.model.toLowerCase()}`,
        `${forklift.capacity}T MGA Stand-up Electric Forklift ${forklift.model} | Forklift Solutions`,
        `High quality ${forklift.capacity}T MGA stand-up electric forklift ${forklift.model}, energy efficient`,
        new Date(),
        new Date()
      ]);

      // Link to electric category
      await queryRunner.query(`
        INSERT INTO product_categories (product_id, category_id)
        SELECT $1, id FROM categories WHERE slug = 'xe-nang-dien'
      `, [productId]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete all products and their relations
    await queryRunner.query(`DELETE FROM product_categories`);
    await queryRunner.query(`DELETE FROM product_translations`);
    await queryRunner.query(`DELETE FROM products`);
  }
} 