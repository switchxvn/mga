import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddElectricForkliftRentalService1743000000028 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert service
    const serviceResult = await queryRunner.query(`
      INSERT INTO services (icon, "order", is_active)
      VALUES ('i-mdi-battery-charging', 3, true)
      RETURNING id;
    `);
    const serviceId = serviceResult[0].id;

    // Insert Vietnamese translation
    await queryRunner.query(`
      INSERT INTO service_translations (
        service_id, locale, title, slug, description, short_description,
        meta_title, meta_description, meta_keywords, og_title, og_description, canonical_url
      )
      VALUES (
        ${serviceId},
        'vi',
        'Dịch vụ cho thuê xe nâng điện',
        'cho-thue-xe-nang-dien',
        E'<div class="service-content">
          <p>Nhằm đáp ứng nhu cầu sản xuất của doanh nghiệp, MGA ngoài bán xe nâng điện mới, chúng tôi còn có dịch vụ cho thuê xe nâng điện mới nhiều sự lựa chọn cho khách hàng.</p>
          
          <div class="service-advantages">
            <h2>Ưu điểm vượt trội của dịch vụ</h2>
            <ul>
              <li>Lắp ráp SKD tại Việt Nam (Nhà máy lắp ráp tại Bình Dương)</li>
              <li>Đội ngũ kỹ sư giỏi, giàu kinh nghiệm được tập huấn và đào tạo tại USA</li>
              <li>Đảm bảo xe hoạt động 24/7 với cường độ sử dụng cao</li>
              <li>Có xe dự phòng và bình điện dự phòng cho khách hàng thuê trên 5 xe</li>
              <li>Miễn phí các chi phí kỹ thuật, bảo trì bảo dưỡng và thay thế linh kiện hao mòn</li>
              <li>Có các chi nhánh phục vụ toàn Việt Nam</li>
            </ul>
          </div>

          <div class="service-when-to-rent">
            <h2>Khi nào nên thuê xe nâng điện?</h2>
            <ul>
              <li>Không muốn bỏ ra chi phí ban đầu cao</li>
              <li>Không muốn tốn thêm chi phí cho đội ngũ nhân viên kỹ thuật</li>
              <li>Không muốn chi phí thay thế linh kiện do hao mòn</li>
              <li>Cần đội xe nâng luôn sẵn sàng phục vụ 24/7</li>
              <li>Hoạt động trong ngành thực phẩm và các ngành yêu cầu không xả khí thải</li>
            </ul>
          </div>

          <h2>Bảng giá cho thuê xe nâng điện</h2>
          <div class="pricing-table">
            <table>
              <thead>
                <tr>
                  <th>Loại xe</th>
                  <th>Hình ảnh</th>
                  <th>Thông số tiêu chuẩn</th>
                  <th>Giá tham khảo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1.5 Tấn</td>
                  <td><img src="https://s3mga.sgp1.digitaloceanspaces.com/products/xe-nang-dien-mga-1-5-tan.jpg" alt="Xe nâng điện MGA 1.5 tấn" /></td>
                  <td>Nâng cao 3 mét, Càng 1070mm</td>
                  <td>Liên hệ</td>
                </tr>
                <tr>
                  <td>2.0 Tấn</td>
                  <td><img src="https://s3mga.sgp1.digitaloceanspaces.com/products/xe-nang-dien-mga-1-5-tan.jpg" alt="Xe nâng điện MGA 2.0 tấn" /></td>
                  <td>Nâng cao 3 mét, Càng 1070mm</td>
                  <td>Liên hệ</td>
                </tr>
                <tr>
                  <td>2.5 Tấn</td>
                  <td><img src="https://s3mga.sgp1.digitaloceanspaces.com/products/xe-nang-dien-mga-1-5-tan.jpg" alt="Xe nâng điện MGA 2.5 tấn" /></td>
                  <td>Nâng cao 3 mét, Càng 1070mm</td>
                  <td>Liên hệ</td>
                </tr>
                <tr>
                  <td>3.0 Tấn</td>
                  <td><img src="https://s3mga.sgp1.digitaloceanspaces.com/products/xe-nang-dien-mga-1-5-tan.jpg" alt="Xe nâng điện MGA 3.0 tấn" /></td>
                  <td>Nâng cao 3 mét, Càng 1220mm</td>
                  <td>Liên hệ</td>
                </tr>
                <tr>
                  <td>3.5 Tấn</td>
                  <td><img src="https://s3mga.sgp1.digitaloceanspaces.com/products/xe-nang-dien-mga-1-5-tan.jpg" alt="Xe nâng điện MGA 3.5 tấn" /></td>
                  <td>Nâng cao 3 mét, Càng 1220mm</td>
                  <td>Liên hệ</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="contact-cta">Liên hệ ngay với MGA để được tư vấn chi tiết về dịch vụ cho thuê xe nâng điện!</p>
        </div>',
        'Dịch vụ cho thuê xe nâng điện MGA với nhiều ưu đãi, hỗ trợ 24/7 và miễn phí bảo trì bảo dưỡng. Có xe và bình điện dự phòng cho khách hàng thuê từ 5 xe trở lên.',
        'Cho thuê xe nâng điện MGA | Dịch vụ cho thuê xe nâng điện chuyên nghiệp',
        'Dịch vụ cho thuê xe nâng điện MGA với đội ngũ kỹ thuật chuyên nghiệp, hỗ trợ 24/7, miễn phí bảo trì và có xe dự phòng. Phục vụ toàn quốc.',
        'cho thuê xe nâng điện, thuê xe nâng điện, xe nâng điện cho thuê, MGA, dịch vụ xe nâng',
        'Dịch vụ Cho thuê xe nâng điện MGA - Giải pháp tối ưu cho doanh nghiệp',
        'Cho thuê xe nâng điện MGA với đầy đủ dịch vụ bảo trì, bảo dưỡng miễn phí. Hỗ trợ 24/7 và có xe dự phòng cho khách hàng.',
        'https://mga.com.vn/dich-vu/cho-thue-xe-nang-dien'
      );
    `);

    // Insert English translation
    await queryRunner.query(`
      INSERT INTO service_translations (
        service_id, locale, title, slug, description, short_description,
        meta_title, meta_description, meta_keywords, og_title, og_description, canonical_url
      )
      VALUES (
        ${serviceId},
        'en',
        'Electric Forklift Rental Service',
        'electric-forklift-rental',
        E'<div class="service-content">
          <p>To meet the production needs of businesses, besides selling new electric forklifts, MGA also offers electric forklift rental services with multiple options for customers.</p>
          
          <div class="service-advantages">
            <h2>Outstanding Advantages</h2>
            <ul>
              <li>SKD assembly in Vietnam (Assembly plant in Binh Duong)</li>
              <li>Team of skilled engineers trained in the USA</li>
              <li>Guaranteed 24/7 operation with high usage intensity</li>
              <li>Backup forklifts and batteries for customers renting more than 5 units</li>
              <li>Free technical, maintenance, and wear parts replacement</li>
              <li>Branches serving all of Vietnam</li>
            </ul>
          </div>

          <div class="service-when-to-rent">
            <h2>When to Rent an Electric Forklift?</h2>
            <ul>
              <li>When you want to avoid high initial costs</li>
              <li>When you don''t want to spend on technical staff</li>
              <li>When you want to avoid wear and tear replacement costs</li>
              <li>When you need a forklift fleet ready 24/7</li>
              <li>For food industry and zero-emission requirements</li>
            </ul>
          </div>

          <h2>Electric Forklift Rental Price List</h2>
          <div class="pricing-table">
            <table>
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Image</th>
                  <th>Specifications</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1.5 Tons</td>
                  <td><img src="https://s3mga.sgp1.digitaloceanspaces.com/products/xe-nang-dien-mga-1-5-tan.jpg" alt="MGA Electric Forklift 1.5 tons" /></td>
                  <td>3m lift height, 1070mm fork</td>
                  <td>Contact us</td>
                </tr>
                <tr>
                  <td>2.0 Tons</td>
                  <td><img src="https://s3mga.sgp1.digitaloceanspaces.com/products/xe-nang-dien-mga-1-5-tan.jpg" alt="MGA Electric Forklift 2.0 tons" /></td>
                  <td>3m lift height, 1070mm fork</td>
                  <td>Contact us</td>
                </tr>
                <tr>
                  <td>2.5 Tons</td>
                  <td><img src="https://s3mga.sgp1.digitaloceanspaces.com/products/xe-nang-dien-mga-1-5-tan.jpg" alt="MGA Electric Forklift 2.5 tons" /></td>
                  <td>3m lift height, 1070mm fork</td>
                  <td>Contact us</td>
                </tr>
                <tr>
                  <td>3.0 Tons</td>
                  <td><img src="https://s3mga.sgp1.digitaloceanspaces.com/products/xe-nang-dien-mga-1-5-tan.jpg" alt="MGA Electric Forklift 3.0 tons" /></td>
                  <td>3m lift height, 1220mm fork</td>
                  <td>Contact us</td>
                </tr>
                <tr>
                  <td>3.5 Tons</td>
                  <td><img src="https://s3mga.sgp1.digitaloceanspaces.com/products/xe-nang-dien-mga-1-5-tan.jpg" alt="MGA Electric Forklift 3.5 tons" /></td>
                  <td>3m lift height, 1220mm fork</td>
                  <td>Contact us</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p class="contact-cta">Contact MGA now for detailed consultation on electric forklift rental services!</p>
        </div>',
        'MGA electric forklift rental service with many benefits, 24/7 support, and free maintenance. Backup forklifts and batteries available for customers renting 5 or more units.',
        'MGA Electric Forklift Rental | Professional Electric Forklift Rental Service',
        'MGA electric forklift rental service with professional technical team, 24/7 support, free maintenance, and backup units. Serving nationwide.',
        'electric forklift rental, rent electric forklift, MGA, forklift service',
        'MGA Electric Forklift Rental Service - Optimal Solution for Businesses',
        'Rent MGA electric forklifts with complete free maintenance services. 24/7 support and backup units available for customers.',
        'https://mga.com.vn/en/services/electric-forklift-rental'
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Get the service id first
    const result = await queryRunner.query(`
      SELECT id FROM services 
      WHERE icon = 'i-mdi-battery-charging' 
      ORDER BY id DESC 
      LIMIT 1
    `);

    if (result && result[0]) {
      const serviceId = result[0].id;
      
      // Delete translations
      await queryRunner.query(`
        DELETE FROM service_translations 
        WHERE service_id = ${serviceId}
      `);

      // Delete service
      await queryRunner.query(`
        DELETE FROM services 
        WHERE id = ${serviceId}
      `);
    }
  }
} 