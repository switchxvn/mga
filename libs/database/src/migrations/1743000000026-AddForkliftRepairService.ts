import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForkliftRepairService1743000000026 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert service
    await queryRunner.query(`
      INSERT INTO services (icon, "order", is_active)
      VALUES ('i-mdi-wrench', 1, true)
      RETURNING id;
    `);

    // Get the inserted service id
    const result = await queryRunner.query('SELECT id FROM services ORDER BY id DESC LIMIT 1');
    const serviceId = result[0].id;

    // Insert Vietnamese translation
    await queryRunner.query(`
      INSERT INTO service_translations (
        service_id,
        locale,
        title,
        slug,
        description,
        short_description,
        meta_title,
        meta_description,
        meta_keywords,
        og_title,
        og_description,
        canonical_url
      )
      VALUES (
        ${serviceId},
        'vi',
        'Dịch vụ sửa chữa xe nâng chuyên nghiệp',
        'sua-xe-nang',
        '<div class="service-content">
          <p>Dịch vụ sửa chữa xe nâng chuyên nghiệp tại MGA - Giải pháp toàn diện cho mọi vấn đề về xe nâng của bạn.</p>

          <h2>Dịch vụ sửa chữa xe nâng là gì?</h2>
          <p>Sửa chữa xe nâng là quá trình kiểm tra, bảo dưỡng và khắc phục các sự cố kỹ thuật trên xe nâng nhằm đảm bảo hoạt động hiệu quả và an toàn. Sau thời gian dài sử dụng, các hệ thống quan trọng như bơm thủy lực, ty ben, động cơ có thể xuống cấp, ảnh hưởng đến công suất và hiệu quả làm việc của xe.</p>

          <h2>Quy trình sửa chữa xe nâng chuyên nghiệp tại MGA</h2>
          <div class="service-steps">
            <div class="step">
              <h3>1. Khảo sát và Đánh giá</h3>
              <ul>
                <li>Tiếp nhận yêu cầu từ khách hàng</li>
                <li>Kỹ thuật viên chuyên nghiệp khảo sát toàn diện</li>
                <li>Đánh giá chi tiết tình trạng các bộ phận</li>
              </ul>
            </div>

            <div class="step">
              <h3>2. Lập kế hoạch sửa chữa</h3>
              <ul>
                <li>Báo cáo chi tiết các hạng mục cần sửa chữa</li>
                <li>Tư vấn giải pháp tối ưu cho khách hàng</li>
                <li>Lên kế hoạch thời gian và chi phí sửa chữa</li>
              </ul>
            </div>

            <div class="step">
              <h3>3. Tiến hành sửa chữa</h3>
              <ul>
                <li>Thay thế linh kiện hư hỏng bằng phụ tùng chính hãng</li>
                <li>Sửa chữa các bộ phận theo tiêu chuẩn kỹ thuật</li>
                <li>Kiểm tra trong quá trình sửa chữa</li>
              </ul>
            </div>

            <div class="step">
              <h3>4. Kiểm tra và bàn giao</h3>
              <ul>
                <li>Kiểm tra toàn diện sau sửa chữa</li>
                <li>Áp dụng quy trình kiểm tra như xe mới</li>
                <li>Chạy thử nghiệm và đánh giá hiệu quả</li>
              </ul>
            </div>
          </div>

          <h2>Cam kết dịch vụ</h2>
          <ul class="service-commitments">
            <li>Đội ngũ kỹ thuật viên giàu kinh nghiệm</li>
            <li>Trang thiết bị hiện đại</li>
            <li>Phụ tùng chính hãng 100%</li>
            <li>Giá cả cạnh tranh</li>
            <li>Thời gian sửa chữa nhanh chóng</li>
          </ul>

          <h2>Chế độ bảo hành và bảo trì</h2>
          <ul class="warranty-maintenance">
            <li>Bảo hành sửa chữa từ 3-12 tháng</li>
            <li>Bảo trì trọn đời sau sửa chữa</li>
            <li>Hỗ trợ kỹ thuật 24/7</li>
            <li>Dịch vụ bảo trì định kỳ</li>
          </ul>

          <p class="contact-cta">Liên hệ ngay với MGA để được tư vấn và báo giá dịch vụ sửa chữa xe nâng!</p>
        </div>',
        'Dịch vụ sửa chữa xe nâng chuyên nghiệp tại MGA với đội ngũ kỹ thuật viên giàu kinh nghiệm, trang thiết bị hiện đại và phụ tùng chính hãng. Bảo hành từ 3-12 tháng, bảo trì trọn đời.',
        'Dịch vụ sửa chữa xe nâng chuyên nghiệp | MGA',
        'Dịch vụ sửa chữa xe nâng chuyên nghiệp tại MGA. Đội ngũ kỹ thuật viên giàu kinh nghiệm, trang thiết bị hiện đại, phụ tùng chính hãng. Bảo hành từ 3-12 tháng, bảo trì trọn đời.',
        'sửa chữa xe nâng, bảo dưỡng xe nâng, sửa xe nâng, dịch vụ xe nâng, sửa chữa xe nâng chuyên nghiệp, bảo trì xe nâng',
        'Dịch vụ sửa chữa xe nâng chuyên nghiệp | MGA',
        'MGA cung cấp dịch vụ sửa chữa xe nâng chuyên nghiệp với đội ngũ kỹ thuật viên giàu kinh nghiệm. Bảo hành từ 3-12 tháng, bảo trì trọn đời. Liên hệ ngay để được tư vấn!',
        'https://mga.com.vn/dich-vu/sua-xe-nang'
      );
    `);

    // Insert English translation
    await queryRunner.query(`
      INSERT INTO service_translations (
        service_id,
        locale,
        title,
        slug,
        description,
        short_description,
        meta_title,
        meta_description,
        meta_keywords,
        og_title,
        og_description,
        canonical_url
      )
      VALUES (
        ${serviceId},
        'en',
        'Professional Forklift Repair Services',
        'forklift-repair',
        '<div class="service-content">
          <p>Professional Forklift Repair Services at MGA - Comprehensive solutions for all your forklift needs.</p>

          <h2>What is Forklift Repair Service?</h2>
          <p>Forklift repair service involves inspection, maintenance, and resolution of technical issues in forklifts to ensure efficient and safe operation. After long periods of use, critical systems such as hydraulic pumps, cylinders, and engines may deteriorate, affecting the performance and efficiency of the vehicle.</p>

          <h2>Professional Forklift Repair Process at MGA</h2>
          <div class="service-steps">
            <div class="step">
              <h3>1. Inspection and Assessment</h3>
              <ul>
                <li>Receiving customer requests</li>
                <li>Professional technician comprehensive inspection</li>
                <li>Detailed assessment of component conditions</li>
              </ul>
            </div>

            <div class="step">
              <h3>2. Repair Planning</h3>
              <ul>
                <li>Detailed report of repair items needed</li>
                <li>Consulting optimal solutions for customers</li>
                <li>Planning repair timeline and costs</li>
              </ul>
            </div>

            <div class="step">
              <h3>3. Repair Execution</h3>
              <ul>
                <li>Replacing damaged parts with genuine components</li>
                <li>Repairing components to technical standards</li>
                <li>Inspection during repair process</li>
              </ul>
            </div>

            <div class="step">
              <h3>4. Testing and Handover</h3>
              <ul>
                <li>Comprehensive post-repair inspection</li>
                <li>Applying new vehicle inspection standards</li>
                <li>Test run and performance evaluation</li>
              </ul>
            </div>
          </div>

          <h2>Service Commitments</h2>
          <ul class="service-commitments">
            <li>Experienced technical team</li>
            <li>Modern equipment</li>
            <li>100% genuine parts</li>
            <li>Competitive pricing</li>
            <li>Quick repair turnaround</li>
          </ul>

          <h2>Warranty and Maintenance</h2>
          <ul class="warranty-maintenance">
            <li>3-12 months repair warranty</li>
            <li>Lifetime maintenance after repair</li>
            <li>24/7 technical support</li>
            <li>Regular maintenance service</li>
          </ul>

          <p class="contact-cta">Contact MGA now for forklift repair consultation and quotation!</p>
        </div>',
        'Professional forklift repair services at MGA with experienced technicians, modern equipment, and genuine parts. 3-12 months warranty with lifetime maintenance.',
        'Professional Forklift Repair Services | MGA',
        'Professional forklift repair services at MGA. Experienced technicians, modern equipment, genuine parts. 3-12 months warranty with lifetime maintenance.',
        'forklift repair, forklift maintenance, forklift service, professional forklift repair, forklift repair service, forklift maintenance service',
        'Professional Forklift Repair Services | MGA',
        'MGA provides professional forklift repair services with experienced technicians. 3-12 months warranty with lifetime maintenance. Contact us now for consultation!',
        'https://mga.com.vn/en/services/forklift-repair'
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Get the service id first
    const result = await queryRunner.query(`
      SELECT id FROM services 
      WHERE icon = 'i-mdi-wrench' 
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