import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForkliftAccessoriesData1743270380243 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Insert category
    await queryRunner.query(`
      INSERT INTO categories (active, is_featured, category_type)
      VALUES (true, false, 'product')
      RETURNING id;
    `).then(async (result) => {
      const categoryId = result[0].id;

      // Insert category translations
      await queryRunner.query(`
        INSERT INTO category_translations (category_id, locale, name, description, slug, meta_title, meta_description)
        VALUES 
        (${categoryId}, 'vi', 'Phụ tùng xe nâng', 'Chuyên cung cấp các loại phụ tùng xe nâng chất lượng cao, đảm bảo hoạt động ổn định và an toàn cho xe nâng của bạn.', 'phu-tung-xe-nang', 'Phụ tùng xe nâng chính hãng, chất lượng cao', 'Cung cấp phụ tùng xe nâng chính hãng, đa dạng mẫu mã, giá cả cạnh tranh. Phân phối các loại càng kẹp, bộ càng gắt gù, càng kẹp thùng carton và nhiều phụ tùng khác.'),
        (${categoryId}, 'en', 'Forklift Accessories', 'Providing high-quality forklift accessories to ensure stable and safe operation of your forklift.', 'forklift-accessories', 'Genuine Forklift Accessories, High Quality', 'Supply genuine forklift accessories, diverse models, competitive prices. Distribute various types of clamps, fork attachments, carton clamps and other accessories.');
      `);

      // 2. Insert products
      const products = [
        {
          name_vi: 'Bộ càng gắt gù',
          name_en: 'Fork Attachment Set',
          slug_vi: 'bo-cang-gat-gu',
          slug_en: 'fork-attachment-set',
          short_description_vi: 'Bộ càng gắt gù chất lượng cao, tăng khả năng xử lý hàng hóa của xe nâng',
          short_description_en: 'High-quality fork attachment set for enhanced material handling',
          description_vi: 'Bộ càng gắt gù chất lượng cao, được thiết kế đặc biệt để tăng khả năng xử lý hàng hóa của xe nâng. Sản phẩm được làm từ thép chất lượng cao, đảm bảo độ bền và an toàn khi sử dụng.',
          description_en: 'High-quality fork attachment set, specially designed to enhance the material handling capabilities of forklifts. Made from high-grade steel, ensuring durability and safety during operation.'
        },
        {
          name_vi: 'Bộ dịch càng nâng',
          name_en: 'Fork Positioner',
          slug_vi: 'bo-dich-cang-nang',
          slug_en: 'fork-positioner',
          short_description_vi: 'Điều chỉnh khoảng cách càng nâng linh hoạt, tối ưu cho nhiều loại hàng hóa',
          short_description_en: 'Flexible fork distance adjustment for various cargo sizes',
          description_vi: 'Bộ dịch càng nâng giúp điều chỉnh khoảng cách giữa các càng nâng một cách linh hoạt, tăng hiệu quả trong việc xử lý các loại hàng hóa có kích thước khác nhau.',
          description_en: 'Fork positioner allows flexible adjustment of the distance between forks, increasing efficiency in handling various sizes of goods.'
        },
        {
          name_vi: 'Bộ dịch chuyển khung nâng',
          name_en: 'Side Shifter',
          slug_vi: 'bo-dich-chuyen-khung-nang',
          slug_en: 'side-shifter',
          short_description_vi: 'Di chuyển càng nâng sang trái phải mà không cần di chuyển xe',
          short_description_en: 'Move forks left or right without repositioning the forklift',
          description_vi: 'Bộ dịch chuyển khung nâng cho phép di chuyển càng nâng sang trái hoặc phải mà không cần di chuyển xe nâng, tăng độ chính xác và hiệu quả trong việc xếp dỡ hàng hóa.',
          description_en: 'Side shifter allows moving the forks left or right without moving the forklift, increasing accuracy and efficiency in cargo handling.'
        },
        {
          name_vi: 'Càng gắt gù',
          name_en: 'Fork Extension',
          slug_vi: 'cang-gat-gu',
          slug_en: 'fork-extension',
          short_description_vi: 'Kéo dài càng nâng để xử lý hàng hóa kích thước lớn',
          short_description_en: 'Extend fork length for handling oversized cargo',
          description_vi: 'Càng gắt gù được thiết kế để kéo dài chiều dài của càng nâng, giúp xử lý các loại hàng hóa có kích thước lớn một cách an toàn và hiệu quả.',
          description_en: 'Fork extension designed to extend the length of the forks, enabling safe and efficient handling of oversized cargo.'
        },
        {
          name_vi: 'Càng kéo dây',
          name_en: 'Wire Rope Fork',
          slug_vi: 'cang-keo-day',
          slug_en: 'wire-rope-fork',
          short_description_vi: 'Chuyên dụng cho vận chuyển dây cáp và vật liệu dạng cuộn',
          short_description_en: 'Specialized for handling wire ropes and coiled materials',
          description_vi: 'Càng kéo dây được thiết kế đặc biệt để xử lý các loại vật liệu dạng cuộn như dây cáp, dây điện. Sản phẩm được làm từ thép chất lượng cao, đảm bảo độ bền và an toàn.',
          description_en: 'Wire rope fork specially designed for handling coiled materials such as cables and wires. Made from high-quality steel, ensuring durability and safety.'
        },
        {
          name_vi: 'Càng kẹp',
          name_en: 'Forklift Clamp',
          slug_vi: 'cang-kep',
          slug_en: 'forklift-clamp',
          short_description_vi: 'Càng kẹp đa năng với độ bền cao và khả năng kẹp chắc chắn',
          short_description_en: 'Durable multi-purpose clamp with secure gripping capability',
          description_vi: 'Càng kẹp xe nâng được thiết kế chuyên dụng để nâng và di chuyển các vật liệu đặc biệt. Sản phẩm có độ bền cao và khả năng kẹp chắc chắn, đảm bảo an toàn trong quá trình vận chuyển.',
          description_en: 'Forklift clamp specially designed for lifting and moving special materials. The product features high durability and secure gripping capability, ensuring safety during transportation.'
        },
        {
          name_vi: 'Càng kẹp bánh lốp',
          name_en: 'Tire Clamp',
          slug_vi: 'cang-kep-banh-lop',
          slug_en: 'tire-clamp',
          short_description_vi: 'Thiết kế chuyên dụng cho xử lý và vận chuyển lốp xe',
          short_description_en: 'Specialized design for tire handling and transportation',
          description_vi: 'Càng kẹp bánh lốp chuyên dụng cho xe nâng, được thiết kế để xử lý và vận chuyển lốp xe an toàn và hiệu quả. Phù hợp cho các nhà máy sản xuất lốp và trung tâm bảo dưỡng xe.',
          description_en: 'Specialized tire clamp for forklifts, designed for safe and efficient tire handling and transportation. Suitable for tire manufacturing plants and vehicle maintenance centers.'
        },
        {
          name_vi: 'Càng kẹp cuộn giấy',
          name_en: 'Paper Roll Clamp',
          slug_vi: 'cang-kep-cuon-giay',
          slug_en: 'paper-roll-clamp',
          short_description_vi: 'Chuyên dụng cho ngành công nghiệp giấy và in ấn',
          short_description_en: 'Specialized for paper and printing industry',
          description_vi: 'Càng kẹp cuộn giấy được thiết kế đặc biệt để xử lý các cuộn giấy lớn trong ngành công nghiệp giấy và in ấn. Đảm bảo an toàn và không làm hỏng cuộn giấy trong quá trình vận chuyển.',
          description_en: 'Paper roll clamp specially designed for handling large paper rolls in the paper and printing industry. Ensures safety and prevents damage to paper rolls during transportation.'
        },
        {
          name_vi: 'Càng kẹp đa năng',
          name_en: 'Multi-purpose Clamp',
          slug_vi: 'cang-kep-da-nang',
          slug_en: 'multi-purpose-clamp',
          short_description_vi: 'Thiết kế linh hoạt cho nhiều loại hàng hóa khác nhau',
          short_description_en: 'Flexible design for various types of goods',
          description_vi: 'Càng kẹp đa năng với thiết kế linh hoạt, có thể xử lý nhiều loại hàng hóa khác nhau. Phù hợp cho các nhà máy và kho hàng có nhu cầu vận chuyển đa dạng vật liệu.',
          description_en: 'Multi-purpose clamp with flexible design, capable of handling various types of goods. Suitable for factories and warehouses with diverse material handling needs.'
        },
        {
          name_vi: 'Càng kẹp khối vuông',
          name_en: 'Block Clamp',
          slug_vi: 'cang-kep-khoi-vuong',
          slug_en: 'block-clamp',
          short_description_vi: 'Chuyên dụng cho vật liệu xây dựng và hàng khối vuông',
          short_description_en: 'Specialized for construction materials and block loads',
          description_vi: 'Càng kẹp khối vuông được thiết kế để xử lý các khối hàng có hình dạng vuông hoặc chữ nhật. Đặc biệt phù hợp cho việc vận chuyển gạch, đá và các vật liệu xây dựng.',
          description_en: 'Block clamp designed for handling square or rectangular block loads. Particularly suitable for transporting bricks, stones, and construction materials.'
        },
        {
          name_vi: 'Càng kẹp mút xốp',
          name_en: 'Foam Clamp',
          slug_vi: 'cang-kep-mut-xop',
          slug_en: 'foam-clamp',
          short_description_vi: 'Bề mặt kẹp mềm cho vật liệu dễ vỡ và nhẹ',
          short_description_en: 'Soft gripping surface for fragile and lightweight materials',
          description_vi: 'Càng kẹp mút xốp được thiết kế đặc biệt với bề mặt kẹp mềm, phù hợp để xử lý các vật liệu dễ vỡ như mút xốp và các sản phẩm nhẹ khác mà không gây hư hại.',
          description_en: 'Foam clamp specially designed with soft gripping surface, suitable for handling fragile materials like foam and other lightweight products without causing damage.'
        },
        {
          name_vi: 'Càng kẹp ống thép',
          name_en: 'Steel Pipe Clamp',
          slug_vi: 'cang-kep-ong-thep',
          slug_en: 'steel-pipe-clamp',
          short_description_vi: 'Chuyên dụng cho ống thép và vật liệu hình trụ',
          short_description_en: 'Specialized for steel pipes and cylindrical materials',
          description_vi: 'Càng kẹp ống thép được thiết kế chuyên dụng để vận chuyển các loại ống thép và vật liệu hình trụ. Có khả năng chịu tải cao và đảm bảo an toàn trong quá trình vận chuyển.',
          description_en: 'Steel pipe clamp specially designed for transporting steel pipes and cylindrical materials. Features high load capacity and ensures safety during transportation.'
        },
        {
          name_vi: 'Càng kẹp thùng carton',
          name_en: 'Carton Box Clamp',
          slug_vi: 'cang-kep-thung-carton',
          slug_en: 'carton-box-clamp',
          short_description_vi: 'Áp lực kẹp phù hợp cho thùng carton và hàng đóng gói',
          short_description_en: 'Appropriate clamping pressure for cardboard boxes and packaged goods',
          description_vi: 'Càng kẹp thùng carton được thiết kế với áp lực kẹp phù hợp để xử lý các thùng carton mà không làm hỏng hàng hóa bên trong. Tăng hiệu quả trong việc xử lý hàng hóa đóng gói.',
          description_en: 'Carton box clamp designed with appropriate clamping pressure to handle cardboard boxes without damaging the contents. Increases efficiency in handling packaged goods.'
        },
        {
          name_vi: 'Càng kẹp xoay',
          name_en: 'Rotating Clamp',
          slug_vi: 'cang-kep-xoay',
          slug_en: 'rotating-clamp',
          short_description_vi: 'Xoay hàng hóa 360 độ cho định vị chính xác',
          short_description_en: '360-degree rotation for precise positioning',
          description_vi: 'Càng kẹp xoay cho phép xoay hàng hóa 360 độ, giúp định vị chính xác và xử lý hàng hóa linh hoạt. Phù hợp cho các công việc đòi hỏi độ chính xác cao trong việc xếp dỡ hàng.',
          description_en: 'Rotating clamp allows 360-degree rotation of goods, enabling precise positioning and flexible handling. Suitable for tasks requiring high accuracy in cargo handling.'
        },
        {
          name_vi: 'Càng kẹp thùng phuy',
          name_en: 'Tanker Clamp',
          slug_vi: 'cang-kep-thung-phuy',
          slug_en: 'tanker-clamp',
          short_description_vi: 'Chuyên dụng cho vận chuyển chất lỏng và hàng hóa dạng thùng phuy',
          short_description_en: 'Specialized for transporting liquid and tanker goods',
          description_vi: 'Càng kẹp thùng phuy được thiết kế đặc biệt để xử lý các thùng phuy chất lỏng và hàng hóa dạng thùng phuy. Đảm bảo an toàn và không làm hỏng hàng hóa trong quá trình vận chuyển.',
          description_en: 'Tanker clamp specially designed for handling liquid and tanker goods. Ensures safety and prevents damage to goods during transportation.'
        },
        {
          name_vi: 'Càng quay ngang',
          name_en: 'Side Rotating Clamp',
          slug_vi: 'cang-quay-ngang',
          slug_en: 'side-rotating-clamp',
          short_description_vi: 'Quay hàng hóa 90 độ cho định vị chính xác',
          short_description_en: '90-degree rotation for precise positioning',
          description_vi: 'Càng quay ngang cho phép quay hàng hóa 90 độ, giúp định vị chính xác và xử lý hàng hóa linh hoạt. Phù hợp cho các công việc đòi hỏi độ chính xác cao trong việc xếp dỡ hàng.',
          description_en: 'Side rotating clamp allows 90-degree rotation of goods, enabling precise positioning and flexible handling. Suitable for tasks requiring high accuracy in cargo handling.'
        },
        {
          name_vi: 'Càng xử lý nhiều pallet',
          name_en: 'Multi-Pallet Clamp',
          slug_vi: 'cang-xu-ly-nhieu-pallet',
          slug_en: 'multi-pallet-clamp',
          short_description_vi: 'Chuyên dụng cho vận chuyển nhiều pallet',
          short_description_en: 'Specialized for transporting multiple pallets',
          description_vi: 'Càng xử lý nhiều pallet được thiết kế đặc biệt để xử lý các pallet lớn và nhiều pallet. Đảm bảo an toàn và không làm hỏng pallet trong quá trình vận chuyển.',
          description_en: 'Multi-pallet clamp designed for handling large and multiple pallets. Ensures safety and prevents damage to pallets during transportation.'
        },
        {
          name_vi: 'Mâm xoay xe nâng',
          name_en: 'Forklift Rotating Plate',
          slug_vi: 'man-xoay-xe-nang',
          slug_en: 'forklift-rotating-plate',
          short_description_vi: 'Xoay hàng hóa 360 độ cho định vị chính xác',
          short_description_en: '360-degree rotation for precise positioning',
          description_vi: 'Mâm xoay xe nâng được thiết kế đặc biệt để xoay hàng hóa 360 độ, giúp định vị chính xác và xử lý hàng hóa linh hoạt. Phù hợp cho các công việc đòi hỏi độ chính xác cao trong việc xếp dỡ hàng.',
          description_en: 'Forklift rotating plate designed for 360-degree rotation of goods, enabling precise positioning and flexible handling. Suitable for tasks requiring high accuracy in cargo handling.'
        },
        {
          name_vi: 'Ngã ba kẹp xe nâng',
          name_en: 'Forklift T-Junction Clamp',
          slug_vi: 'nga-ba-kep-xe-nang',
          slug_en: 'forklift-t-junction-clamp',
          short_description_vi: 'Chuyên dụng cho vận chuyển hàng hóa trên ngã ba',
          short_description_en: 'Specialized for transporting goods on T-junction',
          description_vi: 'Ngã ba kẹp xe nâng được thiết kế đặc biệt để xử lý các ngã ba trong việc vận chuyển hàng hóa. Đảm bảo an toàn và không làm hỏng hàng hóa trong quá trình vận chuyển.',
          description_en: 'Forklift T-junction clamp designed for handling goods on T-junctions. Ensures safety and prevents damage to goods during transportation.'
        }
      ];

      for (const product of products) {
        // Insert product
        const [productResult] = await queryRunner.query(`
          INSERT INTO products (published, quantity, thumbnail)
          VALUES (true, 999, 'https://s3mga.sgp1.digitaloceanspaces.com/products/${product.slug_en}.jpg')
          RETURNING id;
        `);

        const productId = productResult.id;

        // Insert product translations with short_description
        await queryRunner.query(`
          INSERT INTO product_translations (product_id, locale, title, content, short_description, slug, meta_title, meta_description)
          VALUES 
          (${productId}, 'vi', '${product.name_vi}', '${product.description_vi}', '${product.short_description_vi}', '${product.slug_vi}', '${product.name_vi} chính hãng, chất lượng cao', '${product.description_vi}'),
          (${productId}, 'en', '${product.name_en}', '${product.description_en}', '${product.short_description_en}', '${product.slug_en}', 'Genuine ${product.name_en}, High Quality', '${product.description_en}');
        `);

        // Link product to category
        await queryRunner.query(`
          INSERT INTO product_categories (product_id, category_id)
          VALUES (${productId}, ${categoryId});
        `);
      }
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Find category ID
    const category = await queryRunner.query(`
      SELECT id FROM categories 
      WHERE id IN (
        SELECT category_id FROM category_translations 
        WHERE slug = 'phu-tung-xe-nang'
      );
    `);

    if (category && category[0]) {
      const categoryId = category[0].id;

      // Delete product_categories links
      await queryRunner.query(`
        DELETE FROM product_categories 
        WHERE category_id = ${categoryId};
      `);

      // Delete products
      await queryRunner.query(`
        DELETE FROM products 
        WHERE id IN (
          SELECT product_id 
          FROM product_translations 
          WHERE slug IN (
            'bo-cang-gat-gu',
            'bo-dich-cang-nang',
            'bo-dich-chuyen-khung-nang',
            'cang-gat-gu',
            'cang-keo-day',
            'cang-kep',
            'cang-kep-banh-lop',
            'cang-kep-cuon-giay',
            'cang-kep-da-nang',
            'cang-kep-khoi-vuong',
            'cang-kep-mut-xop',
            'cang-kep-ong-thep',
            'cang-kep-thung-carton',
            'cang-kep-xoay'
          )
        );
      `);

      // Delete category
      await queryRunner.query(`
        DELETE FROM categories 
        WHERE id = ${categoryId};
      `);
    }
  }
} 