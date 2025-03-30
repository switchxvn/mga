import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddForkliftMaintenanceService1743270380242 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert new service
    await queryRunner.query(`
      INSERT INTO services (
        icon,
        thumbnail,
        "order",
        is_active,
        is_featured,
        is_new,
        created_at,
        updated_at
      ) VALUES (
        'wrench-screwdriver',
        'maintenance-service.jpg',
        1,
        true,
        true,
        true,
        NOW(),
        NOW()
      )
    `);

    // Get the inserted service ID
    const serviceId = await queryRunner.query(`SELECT currval('services_id_seq')`);

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
        og_image,
        canonical_url,
        created_at,
        updated_at
      ) VALUES (
        ${serviceId[0].currval},
        'vi',
        'Yêu cầu bảo dưỡng xe nâng',
        'yeu-cau-bao-duong',
        '<div class="service-content">
          <h2>Dịch vụ bảo dưỡng xe nâng chuyên nghiệp</h2>
          <p>Chúng tôi cung cấp dịch vụ bảo dưỡng xe nâng toàn diện, đảm bảo xe nâng của bạn luôn hoạt động hiệu quả và an toàn.</p>
          
          <h3>Các dịch vụ bảo dưỡng</h3>
          <ul>
            <li>Kiểm tra và bảo dưỡng định kỳ</li>
            <li>Thay thế phụ tùng chính hãng</li>
            <li>Sửa chữa và khắc phục sự cố</li>
            <li>Tư vấn kỹ thuật chuyên nghiệp</li>
          </ul>

          <h3>Quy trình bảo dưỡng chuyên nghiệp</h3>
          <ol>
            <li>Kiểm tra tổng thể</li>
            <li>Chẩn đoán các vấn đề</li>
            <li>Đề xuất giải pháp</li>
            <li>Thực hiện bảo dưỡng</li>
            <li>Kiểm tra sau bảo dưỡng</li>
          </ol>

          <h3>Cam kết dịch vụ</h3>
          <ul>
            <li>Đội ngũ kỹ thuật viên giàu kinh nghiệm</li>
            <li>Phụ tùng chính hãng 100%</li>
            <li>Bảo hành dài hạn</li>
            <li>Giá cả cạnh tranh</li>
          </ul>
        </div>',
        'Dịch vụ bảo dưỡng xe nâng chuyên nghiệp, toàn diện với đội ngũ kỹ thuật viên giàu kinh nghiệm và phụ tùng chính hãng.',
        'Yêu cầu bảo dưỡng xe nâng | MGA Forklift',
        'Dịch vụ bảo dưỡng xe nâng chuyên nghiệp tại MGA Forklift. Đội ngũ kỹ thuật viên giàu kinh nghiệm, phụ tùng chính hãng, giá cả cạnh tranh.',
        'bảo dưỡng xe nâng, sửa chữa xe nâng, phụ tùng xe nâng chính hãng, dịch vụ xe nâng',
        'Dịch vụ bảo dưỡng xe nâng chuyên nghiệp | MGA Forklift',
        'Cung cấp dịch vụ bảo dưỡng xe nâng toàn diện với đội ngũ kỹ thuật viên giàu kinh nghiệm. Phụ tùng chính hãng, bảo hành dài hạn.',
        'maintenance-service-og.jpg',
        'https://mgaforklift.com/dich-vu/yeu-cau-bao-duong',
        NOW(),
        NOW()
      )
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
        og_image,
        canonical_url,
        created_at,
        updated_at
      ) VALUES (
        ${serviceId[0].currval},
        'en',
        'Request Forklift Maintenance',
        'request-maintenance',
        '<div class="service-content">
          <h2>Professional Forklift Maintenance Service</h2>
          <p>We provide comprehensive forklift maintenance services to ensure your equipment operates efficiently and safely.</p>
          
          <h3>Maintenance Services</h3>
          <ul>
            <li>Regular inspection and maintenance</li>
            <li>Genuine parts replacement</li>
            <li>Repair and troubleshooting</li>
            <li>Professional technical consultation</li>
          </ul>

          <h3>Professional Maintenance Process</h3>
          <ol>
            <li>General inspection</li>
            <li>Problem diagnosis</li>
            <li>Solution proposal</li>
            <li>Maintenance execution</li>
            <li>Post-maintenance check</li>
          </ol>

          <h3>Service Commitment</h3>
          <ul>
            <li>Experienced technical team</li>
            <li>100% genuine parts</li>
            <li>Extended warranty</li>
            <li>Competitive pricing</li>
          </ul>
        </div>',
        'Professional and comprehensive forklift maintenance service with experienced technicians and genuine parts.',
        'Request Forklift Maintenance | MGA Forklift',
        'Professional forklift maintenance service at MGA Forklift. Experienced technicians, genuine parts, competitive pricing.',
        'forklift maintenance, forklift repair, genuine forklift parts, forklift service',
        'Professional Forklift Maintenance Service | MGA Forklift',
        'Providing comprehensive forklift maintenance service with experienced technicians. Genuine parts, extended warranty.',
        'maintenance-service-og.jpg',
        'https://mgaforklift.com/en/services/request-maintenance',
        NOW(),
        NOW()
      )
    `);

    // Insert Korean translation
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
        og_image,
        canonical_url,
        created_at,
        updated_at
      ) VALUES (
        ${serviceId[0].currval},
        'ko',
        '지게차 유지보수 요청',
        'maintenance-request',
        '<div class="service-content">
          <h2>전문 지게차 유지보수 서비스</h2>
          <p>장비가 효율적이고 안전하게 작동하도록 종합적인 지게차 유지보수 서비스를 제공합니다.</p>
          
          <h3>유지보수 서비스</h3>
          <ul>
            <li>정기 점검 및 유지보수</li>
            <li>순정 부품 교체</li>
            <li>수리 및 문제 해결</li>
            <li>전문 기술 상담</li>
          </ul>

          <h3>전문 유지보수 프로세스</h3>
          <ol>
            <li>일반 점검</li>
            <li>문제 진단</li>
            <li>해결책 제안</li>
            <li>유지보수 실행</li>
            <li>유지보수 후 점검</li>
          </ol>

          <h3>서비스 약속</h3>
          <ul>
            <li>숙련된 기술팀</li>
            <li>100% 순정 부품</li>
            <li>연장 보증</li>
            <li>경쟁력 있는 가격</li>
          </ul>
        </div>',
        '숙련된 기술자와 순정 부품을 갖춘 전문적이고 포괄적인 지게차 유지보수 서비스.',
        '지게차 유지보수 요청 | MGA 지게차',
        'MGA 지게차의 전문 지게차 유지보수 서비스. 숙련된 기술자, 순정 부품, 경쟁력 있는 가격.',
        '지게차 유지보수, 지게차 수리, 순정 지게차 부품, 지게차 서비스',
        '전문 지게차 유지보수 서비스 | MGA 지게차',
        '숙련된 기술자와 함께하는 포괄적인 지게차 유지보수 서비스. 순정 부품, 연장 보증.',
        'maintenance-service-og.jpg',
        'https://mgaforklift.com/ko/services/maintenance-request',
        NOW(),
        NOW()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Get the service ID by slug
    const serviceId = await queryRunner.query(`
      SELECT service_id FROM service_translations 
      WHERE slug = 'yeu-cau-bao-duong' AND locale = 'vi'
    `);

    if (serviceId && serviceId[0]) {
      // Delete translations
      await queryRunner.query(`
        DELETE FROM service_translations 
        WHERE service_id = ${serviceId[0].service_id}
      `);

      // Delete service
      await queryRunner.query(`
        DELETE FROM services 
        WHERE id = ${serviceId[0].service_id}
      `);
    }
  }
} 