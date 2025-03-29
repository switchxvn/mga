import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForkliftRentalService1743000000027 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert service
    const serviceResult = await queryRunner.query(`
      INSERT INTO services (icon, "order", is_active)
      VALUES ('i-mdi-truck-delivery', 2, true)
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
        'Dịch vụ cho thuê xe nâng dầu chuyên nghiệp',
        'cho-thue-xe-nang-dau',
        E'<div class="service-content">\n<p>MGA cung cấp dịch vụ cho thuê xe nâng dầu chuyên nghiệp, đáp ứng mọi nhu cầu sản xuất của doanh nghiệp. Với đội xe đa dạng từ 2.5 tấn đến 10 tấn, chúng tôi cam kết mang đến giải pháp vận chuyển hiệu quả và tiết kiệm chi phí cho doanh nghiệp của bạn.</p>\n\n<h2>Ưu điểm vượt trội của dịch vụ cho thuê xe nâng dầu tại MGA</h2>\n<ul class="service-advantages">\n<li>Lắp ráp SKD tại Việt Nam (Nhà máy lắp ráp tại Bình Dương)</li>\n<li>Đội ngũ kỹ sư giỏi, được đào tạo tại USA</li>\n<li>Xe hoạt động 24/7 với cường độ cao</li>\n<li>Có xe dự phòng cho khách hàng thuê trên 5 xe</li>\n<li>Chi phí thuê trọn gói, không phát sinh</li>\n<li>Mạng lưới chi nhánh phủ khắp Việt Nam</li>\n</ul>\n\n<h2>Khi nào nên thuê xe nâng?</h2>\n<div class="rental-reasons">\n<ul>\n<li>Doanh nghiệp cần sử dụng xe nâng nhưng không muốn đầu tư chi phí lớn ban đầu</li>\n<li>Muốn tiết kiệm chi phí vận hành và nhân sự kỹ thuật</li>\n<li>Không muốn lo lắng về chi phí bảo trì, thay thế linh kiện</li>\n<li>Cần đảm bảo hoạt động sản xuất liên tục 24/7</li>\n</ul>\n</div>\n\n<h2>Chi phí thuê xe nâng trọn gói bao gồm</h2>\n<ul class="included-services">\n<li>Chi phí thuê xe hàng tháng</li>\n<li>Chi phí bảo trì, bảo dưỡng định kỳ</li>\n<li>Chi phí thay thế linh kiện hao mòn</li>\n<li>Dịch vụ kỹ thuật 24/7</li>\n<li>Xe dự phòng (đối với khách hàng thuê trên 5 xe)</li>\n</ul>\n\n<h2>Bảng giá cho thuê xe nâng dầu</h2>\n<div class="pricing-table">\n<table>\n<thead>\n<tr>\n<th>Model</th>\n<th>Hình ảnh</th>\n<th>Thông số tiêu chuẩn</th>\n<th>Giá tham khảo</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>2.5 Tấn</td>\n<td><img src="/images/forklift-2.5t.jpg" alt="Xe nâng 2.5 tấn" /></td>\n<td>Nâng cao 3 mét, Càng 1070mm</td>\n<td>Liên hệ</td>\n</tr>\n<tr>\n<td>3.0 Tấn</td>\n<td><img src="/images/forklift-3.0t.jpg" alt="Xe nâng 3.0 tấn" /></td>\n<td>Nâng cao 3 mét, Càng 1070mm</td>\n<td>Liên hệ</td>\n</tr>\n<tr>\n<td>3.5 Tấn</td>\n<td><img src="/images/forklift-3.5t.jpg" alt="Xe nâng 3.5 tấn" /></td>\n<td>Nâng cao 3 mét, Càng 1070mm</td>\n<td>Liên hệ</td>\n</tr>\n<tr>\n<td>5.0 Tấn</td>\n<td><img src="/images/forklift-5.0t.jpg" alt="Xe nâng 5.0 tấn" /></td>\n<td>Nâng cao 3 mét, Càng 1220mm</td>\n<td>Liên hệ</td>\n</tr>\n<tr>\n<td>7.0 Tấn</td>\n<td><img src="/images/forklift-7.0t.jpg" alt="Xe nâng 7.0 tấn" /></td>\n<td>Nâng cao 3 mét, Càng 1220mm</td>\n<td>Liên hệ</td>\n</tr>\n<tr>\n<td>10.0 Tấn</td>\n<td><img src="/images/forklift-10.0t.jpg" alt="Xe nâng 10.0 tấn" /></td>\n<td>Nâng cao 3 mét, Càng 1220mm</td>\n<td>Liên hệ</td>\n</tr>\n</tbody>\n</table>\n</div>\n\n<h2>Quy trình cho thuê xe nâng</h2>\n<div class="rental-process">\n<div class="step">\n<h3>1. Khảo sát nhu cầu</h3>\n<ul>\n<li>Tải trọng xe nâng cần thuê</li>\n<li>Thời gian thuê dự kiến</li>\n<li>Địa điểm sử dụng</li>\n<li>Cường độ sử dụng</li>\n</ul>\n</div>\n\n<div class="step">\n<h3>2. Tư vấn và báo giá</h3>\n<ul>\n<li>Đề xuất model xe phù hợp</li>\n<li>Báo giá chi tiết</li>\n<li>Tư vấn điều khoản hợp đồng</li>\n</ul>\n</div>\n\n<div class="step">\n<h3>3. Ký kết hợp đồng</h3>\n<ul>\n<li>Thống nhất điều khoản</li>\n<li>Ký kết hợp đồng</li>\n<li>Thanh toán theo thỏa thuận</li>\n</ul>\n</div>\n\n<div class="step">\n<h3>4. Bàn giao và hướng dẫn</h3>\n<ul>\n<li>Bàn giao xe tại công trình</li>\n<li>Hướng dẫn sử dụng</li>\n<li>Đào tạo vận hành an toàn</li>\n</ul>\n</div>\n</div>\n\n<p class="contact-cta">Liên hệ ngay với MGA để được tư vấn chi tiết về dịch vụ cho thuê xe nâng!</p>\n</div>',
        'Dịch vụ cho thuê xe nâng dầu chuyên nghiệp tại MGA với đội xe đa dạng từ 2.5 - 10 tấn. Hoạt động 24/7, bảo trì miễn phí, có xe dự phòng. Chi phí trọn gói, không phát sinh.',
        'Cho thuê xe nâng dầu chuyên nghiệp | Giá tốt | MGA',
        'Dịch vụ cho thuê xe nâng dầu tại MGA. Đội xe đa dạng 2.5-10 tấn, hoạt động 24/7, bảo trì miễn phí. Chi phí trọn gói, không phát sinh. Có xe dự phòng cho khách thuê trên 5 xe.',
        'cho thuê xe nâng, thuê xe nâng dầu, xe nâng cho thuê, dịch vụ xe nâng, cho thuê xe nâng 2.5 tấn, cho thuê xe nâng 3 tấn, cho thuê xe nâng 5 tấn, cho thuê xe nâng 7 tấn, cho thuê xe nâng 10 tấn',
        'Cho thuê xe nâng dầu chuyên nghiệp | MGA',
        'MGA cung cấp dịch vụ cho thuê xe nâng dầu với đội xe đa dạng từ 2.5-10 tấn. Hoạt động 24/7, bảo trì miễn phí, có xe dự phòng. Liên hệ ngay để được tư vấn!',
        'https://mga.com.vn/dich-vu/cho-thue-xe-nang-dau'
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
        'Professional Diesel Forklift Rental Services',
        'diesel-forklift-rental',
        E'<div class="service-content">\n<p>MGA provides professional diesel forklift rental services to meet all your business production needs. With a diverse fleet ranging from 2.5 tons to 10 tons, we are committed to delivering efficient and cost-effective transportation solutions for your business.</p>\n\n<h2>Outstanding Advantages of MGA''s Forklift Rental Service</h2>\n<ul class="service-advantages">\n<li>SKD assembly in Vietnam (Assembly plant in Binh Duong)</li>\n<li>Skilled engineering team trained in the USA</li>\n<li>24/7 high-intensity operation capability</li>\n<li>Backup forklifts for clients renting over 5 units</li>\n<li>All-inclusive rental cost, no hidden fees</li>\n<li>Nationwide branch network</li>\n</ul>\n\n<h2>When Should You Rent a Forklift?</h2>\n<div class="rental-reasons">\n<ul>\n<li>When your business needs forklifts but wants to avoid high initial investment</li>\n<li>To save on operational and technical staff costs</li>\n<li>To avoid maintenance and parts replacement concerns</li>\n<li>Need to ensure 24/7 continuous production</li>\n</ul>\n</div>\n\n<h2>All-Inclusive Rental Package Includes</h2>\n<ul class="included-services">\n<li>Monthly rental fee</li>\n<li>Regular maintenance and service</li>\n<li>Wear and tear parts replacement</li>\n<li>24/7 technical support</li>\n<li>Backup units (for clients renting over 5 forklifts)</li>\n</ul>\n\n<h2>Diesel Forklift Rental Price List</h2>\n<div class="pricing-table">\n<table>\n<thead>\n<tr>\n<th>Model</th>\n<th>Image</th>\n<th>Specifications</th>\n<th>Price</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>2.5 Tons</td>\n<td><img src="/images/forklift-2.5t.jpg" alt="2.5 ton forklift" /></td>\n<td>3m lift height, 1070mm fork</td>\n<td>Contact us</td>\n</tr>\n<tr>\n<td>3.0 Tons</td>\n<td><img src="/images/forklift-3.0t.jpg" alt="3.0 ton forklift" /></td>\n<td>3m lift height, 1070mm fork</td>\n<td>Contact us</td>\n</tr>\n<tr>\n<td>3.5 Tons</td>\n<td><img src="/images/forklift-3.5t.jpg" alt="3.5 ton forklift" /></td>\n<td>3m lift height, 1070mm fork</td>\n<td>Contact us</td>\n</tr>\n<tr>\n<td>5.0 Tons</td>\n<td><img src="/images/forklift-5.0t.jpg" alt="5.0 ton forklift" /></td>\n<td>3m lift height, 1220mm fork</td>\n<td>Contact us</td>\n</tr>\n<tr>\n<td>7.0 Tons</td>\n<td><img src="/images/forklift-7.0t.jpg" alt="7.0 ton forklift" /></td>\n<td>3m lift height, 1220mm fork</td>\n<td>Contact us</td>\n</tr>\n<tr>\n<td>10.0 Tons</td>\n<td><img src="/images/forklift-10.0t.jpg" alt="10.0 ton forklift" /></td>\n<td>3m lift height, 1220mm fork</td>\n<td>Contact us</td>\n</tr>\n</tbody>\n</table>\n</div>\n\n<h2>Rental Process</h2>\n<div class="rental-process">\n<div class="step">\n<h3>1. Needs Assessment</h3>\n<ul>\n<li>Required forklift capacity</li>\n<li>Estimated rental duration</li>\n<li>Usage location</li>\n<li>Usage intensity</li>\n</ul>\n</div>\n\n<div class="step">\n<h3>2. Consultation and Quotation</h3>\n<ul>\n<li>Suitable model recommendation</li>\n<li>Detailed pricing</li>\n<li>Contract terms consultation</li>\n</ul>\n</div>\n\n<div class="step">\n<h3>3. Contract Signing</h3>\n<ul>\n<li>Terms agreement</li>\n<li>Contract execution</li>\n<li>Payment arrangements</li>\n</ul>\n</div>\n\n<div class="step">\n<h3>4. Handover and Training</h3>\n<ul>\n<li>On-site forklift delivery</li>\n<li>Operation instructions</li>\n<li>Safety training</li>\n</ul>\n</div>\n</div>\n\n<p class="contact-cta">Contact MGA now for detailed consultation on forklift rental services!</p>\n</div>',
        'Professional diesel forklift rental services at MGA with a diverse fleet from 2.5 - 10 tons. 24/7 operation, free maintenance, backup units available. All-inclusive cost, no hidden fees.',
        'Professional Diesel Forklift Rental | Best Rates | MGA',
        'Diesel forklift rental services at MGA. Fleet range 2.5-10 tons, 24/7 operation, free maintenance. All-inclusive cost, no hidden fees. Backup units for 5+ rentals.',
        'forklift rental, diesel forklift rental, forklift hire, forklift rental service, 2.5 ton forklift rental, 3 ton forklift rental, 5 ton forklift rental, 7 ton forklift rental, 10 ton forklift rental',
        'Professional Diesel Forklift Rental | MGA',
        'MGA offers diesel forklift rental services with a fleet ranging from 2.5-10 tons. 24/7 operation, free maintenance, backup units available. Contact us now for consultation!',
        'https://mga.com.vn/en/services/diesel-forklift-rental'
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Get the service id first
    const result = await queryRunner.query(`
      SELECT id FROM services 
      WHERE icon = 'i-mdi-truck-delivery' 
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