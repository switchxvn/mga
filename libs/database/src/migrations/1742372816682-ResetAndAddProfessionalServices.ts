import { MigrationInterface, QueryRunner } from "typeorm";

export class ResetAndAddProfessionalServices1742372816682 implements MigrationInterface {
  name = 'ResetAndAddProfessionalServices1742372816682';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Xóa dữ liệu cũ
    await queryRunner.query(`TRUNCATE TABLE "service_translations" CASCADE`);
    await queryRunner.query(`TRUNCATE TABLE "services" CASCADE`);

    // Thêm dữ liệu mới cho services
    const services = [
      {
        icon: 'truck',
        order: 1,
        translations: [
          {
            locale: 'vi',
            title: 'Vận chuyển hàng hóa',
            slug: 'van-chuyen-hang-hoa',
            shortDescription: 'Dịch vụ vận chuyển hàng hóa chuyên nghiệp, an toàn và đúng thời gian với đội ngũ tài xế giàu kinh nghiệm.',
            description: `Chúng tôi cung cấp dịch vụ vận chuyển hàng hóa chuyên nghiệp với đội xe đa dạng và hiện đại. Đội ngũ tài xế giàu kinh nghiệm của chúng tôi cam kết đảm bảo hàng hóa của bạn được vận chuyển an toàn và đúng thời gian.

Dịch vụ của chúng tôi bao gồm:
• Vận chuyển hàng hóa nội thành
• Vận chuyển hàng hóa liên tỉnh
• Vận chuyển hàng đông lạnh
• Vận chuyển hàng siêu trường siêu trọng
• Dịch vụ kho bãi và logistics

Tại sao chọn dịch vụ của chúng tôi:
1. Đội xe đa dạng từ xe tải nhỏ đến container
2. Theo dõi hành trình thời gian thực
3. Bảo hiểm hàng hóa toàn diện
4. Giá cả cạnh tranh
5. Hỗ trợ 24/7

Quy trình làm việc chuyên nghiệp:
1. Tiếp nhận yêu cầu vận chuyển
2. Tư vấn và báo giá
3. Lên kế hoạch vận chuyển
4. Thực hiện vận chuyển
5. Bàn giao và xác nhận
6. Chăm sóc khách hàng sau vận chuyển

Liên hệ với chúng tôi ngay để được tư vấn chi tiết về dịch vụ vận chuyển phù hợp với nhu cầu của bạn.`,
            metaTitle: 'Dịch vụ vận chuyển hàng hóa chuyên nghiệp, an toàn và đúng giờ',
            metaDescription: 'Cung cấp dịch vụ vận chuyển hàng hóa chuyên nghiệp với đội xe đa dạng, theo dõi thời gian thực và bảo hiểm toàn diện.',
            metaKeywords: 'vận chuyển hàng hóa, logistics, vận tải đường bộ, dịch vụ vận chuyển, kho bãi'
          },
          {
            locale: 'en',
            title: 'Cargo Transportation',
            slug: 'cargo-transportation',
            shortDescription: 'Professional, safe, and timely cargo transportation services with experienced drivers.',
            description: `We provide professional cargo transportation services with a diverse and modern fleet. Our experienced team of drivers is committed to ensuring your cargo is transported safely and on time.

Our services include:
• Urban cargo transportation
• Inter-provincial transportation
• Cold chain logistics
• Oversized cargo transportation
• Warehousing and logistics services

Why choose our services:
1. Diverse fleet from small trucks to containers
2. Real-time tracking
3. Comprehensive cargo insurance
4. Competitive pricing
5. 24/7 support

Professional workflow:
1. Receiving transportation requests
2. Consultation and quotation
3. Transportation planning
4. Execution
5. Delivery and confirmation
6. After-service customer care

Contact us now for detailed advice on transportation services that suit your needs.`,
            metaTitle: 'Professional, Safe, and Timely Cargo Transportation Services',
            metaDescription: 'Providing professional cargo transportation services with a diverse fleet, real-time tracking, and comprehensive insurance.',
            metaKeywords: 'cargo transportation, logistics, road transport, shipping services, warehousing'
          }
        ]
      },
      {
        icon: 'forklift',
        order: 2,
        translations: [
          {
            locale: 'vi',
            title: 'Cho thuê xe nâng',
            slug: 'cho-thue-xe-nang',
            shortDescription: 'Dịch vụ cho thuê xe nâng chất lượng cao với đa dạng tải trọng, đáp ứng mọi nhu cầu nâng hạ, bốc xếp hàng hóa.',
            description: `Chúng tôi cung cấp dịch vụ cho thuê xe nâng chuyên nghiệp với đội xe đa dạng về tải trọng và kích thước. Tất cả xe nâng của chúng tôi đều được bảo dưỡng định kỳ và đảm bảo an toàn tuyệt đối khi vận hành.

Các loại xe nâng cho thuê:
• Xe nâng điện 1-3 tấn
• Xe nâng dầu 3-10 tấn
• Xe nâng reach truck
• Xe nâng container
• Xe nâng người

Ưu điểm dịch vụ:
1. Đa dạng về chủng loại và tải trọng
2. Bảo dưỡng định kỳ, đảm bảo an toàn
3. Đội ngũ kỹ thuật viên chuyên nghiệp
4. Giá thuê cạnh tranh
5. Dịch vụ hỗ trợ 24/7
6. Giao xe tận nơi

Quy trình cho thuê:
1. Khảo sát nhu cầu
2. Tư vấn loại xe phù hợp
3. Báo giá chi tiết
4. Ký hợp đồng thuê
5. Bàn giao và hướng dẫn sử dụng
6. Hỗ trợ kỹ thuật trong quá trình thuê

Cam kết của chúng tôi:
• Xe nâng luôn trong tình trạng hoạt động tốt
• Đáp ứng nhanh chóng các yêu cầu sửa chữa, bảo trì
• Thay thế xe trong trường hợp gặp sự cố
• Tư vấn chuyên nghiệp, minh bạch

Liên hệ ngay để được tư vấn chi tiết về dịch vụ cho thuê xe nâng phù hợp với nhu cầu của bạn.`,
            metaTitle: 'Dịch vụ cho thuê xe nâng chuyên nghiệp, đa dạng tải trọng',
            metaDescription: 'Cung cấp dịch vụ cho thuê xe nâng chất lượng cao với đa dạng tải trọng, bảo dưỡng định kỳ và hỗ trợ kỹ thuật 24/7.',
            metaKeywords: 'cho thuê xe nâng, xe nâng điện, xe nâng dầu, forklift, cho thuê xe nâng hàng'
          },
          {
            locale: 'en',
            title: 'Forklift Rental',
            slug: 'forklift-rental',
            shortDescription: 'High-quality forklift rental services with diverse load capacities, meeting all lifting and material handling needs.',
            description: `We provide professional forklift rental services with a diverse fleet varying in load capacity and size. All our forklifts undergo regular maintenance and ensure absolute operational safety.

Types of forklifts for rent:
• Electric forklifts 1-3 tons
• Diesel forklifts 3-10 tons
• Reach trucks
• Container handlers
• Man lifts

Service advantages:
1. Diverse types and load capacities
2. Regular maintenance, ensuring safety
3. Professional technical team
4. Competitive rental rates
5. 24/7 support service
6. On-site delivery

Rental process:
1. Needs assessment
2. Suitable forklift consultation
3. Detailed quotation
4. Rental contract signing
5. Handover and usage instruction
6. Technical support during rental period

Our commitments:
• Forklifts always in good working condition
• Quick response to repair and maintenance requests
• Equipment replacement in case of issues
• Professional and transparent consultation

Contact us now for detailed advice on forklift rental services that suit your needs.`,
            metaTitle: 'Professional Forklift Rental Services with Diverse Load Capacities',
            metaDescription: 'Providing high-quality forklift rental services with diverse load capacities, regular maintenance, and 24/7 technical support.',
            metaKeywords: 'forklift rental, electric forklift, diesel forklift, material handling equipment, forklift hire'
          }
        ]
      },
      {
        icon: 'warehouse',
        order: 3,
        translations: [
          {
            locale: 'vi',
            title: 'Dịch vụ kho bãi',
            slug: 'dich-vu-kho-bai',
            shortDescription: 'Cung cấp dịch vụ kho bãi hiện đại với hệ thống quản lý thông minh, đảm bảo an toàn và hiệu quả cho hàng hóa của bạn.',
            description: `Chúng tôi cung cấp giải pháp kho bãi toàn diện với cơ sở vật chất hiện đại và hệ thống quản lý thông minh. Kho của chúng tôi được trang bị đầy đủ thiết bị và công nghệ để đảm bảo an toàn và hiệu quả trong việc lưu trữ hàng hóa.

Dịch vụ của chúng tôi bao gồm:
• Cho thuê kho thường
• Cho thuê kho lạnh
• Dịch vụ đóng gói, dán nhãn
• Quản lý tồn kho
• Dịch vụ xuất nhập kho
• Cross-docking

Cơ sở vật chất:
1. Kho hiện đại với diện tích đa dạng
2. Hệ thống PCCC tiên tiến
3. Camera giám sát 24/7
4. Hệ thống kiểm soát nhiệt độ, độ ẩm
5. Sàn chống tĩnh điện
6. Kệ chứa hàng đa năng

Hệ thống quản lý:
• Phần mềm WMS hiện đại
• Báo cáo realtime
• Kiểm kê định kỳ
• Truy xuất thông tin nhanh chóng
• Tối ưu hóa không gian lưu trữ

Quy trình làm việc:
1. Khảo sát nhu cầu
2. Tư vấn giải pháp
3. Ký kết hợp đồng
4. Nhập kho và sắp xếp
5. Quản lý và báo cáo định kỳ
6. Xuất kho theo yêu cầu

Cam kết của chúng tôi:
• An toàn tuyệt đối cho hàng hóa
• Quy trình làm việc chuyên nghiệp
• Nhân viên được đào tạo bài bản
• Giá cả cạnh tranh
• Hỗ trợ 24/7

Liên hệ với chúng tôi để được tư vấn chi tiết về giải pháp kho bãi phù hợp với doanh nghiệp của bạn.`,
            metaTitle: 'Dịch vụ kho bãi hiện đại với hệ thống quản lý thông minh',
            metaDescription: 'Cung cấp giải pháp kho bãi toàn diện với cơ sở vật chất hiện đại, hệ thống quản lý thông minh và dịch vụ chuyên nghiệp.',
            metaKeywords: 'kho bãi, cho thuê kho, kho lạnh, quản lý kho, logistics, WMS'
          },
          {
            locale: 'en',
            title: 'Warehousing Services',
            slug: 'warehousing-services',
            shortDescription: 'Providing modern warehousing services with smart management systems, ensuring safety and efficiency for your goods.',
            description: `We provide comprehensive warehousing solutions with modern facilities and intelligent management systems. Our warehouses are fully equipped with equipment and technology to ensure safe and efficient storage of goods.

Our services include:
• General warehouse rental
• Cold storage rental
• Packaging and labeling services
• Inventory management
• Inbound and outbound services
• Cross-docking

Facilities:
1. Modern warehouses with diverse areas
2. Advanced fire protection systems
3. 24/7 surveillance cameras
4. Temperature and humidity control systems
5. Anti-static flooring
6. Versatile storage racks

Management system:
• Modern WMS software
• Real-time reporting
• Regular inventory checks
• Quick information retrieval
• Storage space optimization

Work process:
1. Needs assessment
2. Solution consultation
3. Contract signing
4. Storage and arrangement
5. Management and periodic reporting
6. Outbound processing on request

Our commitments:
• Absolute safety for goods
• Professional work procedures
• Well-trained staff
• Competitive pricing
• 24/7 support

Contact us for detailed consultation on warehousing solutions suitable for your business.`,
            metaTitle: 'Modern Warehousing Services with Smart Management Systems',
            metaDescription: 'Providing comprehensive warehousing solutions with modern facilities, smart management systems, and professional services.',
            metaKeywords: 'warehousing, warehouse rental, cold storage, inventory management, logistics, WMS'
          }
        ]
      }
    ];

    // Thêm dữ liệu services
    for (const service of services) {
      const { translations, ...serviceData } = service;
      
      // Insert service
      const result = await queryRunner.query(`
        INSERT INTO "services" ("icon", "order")
        VALUES ($1, $2)
        RETURNING "id"
      `, [serviceData.icon, serviceData.order]);
      
      const serviceId = result[0].id;
      
      // Insert translations
      for (const translation of translations) {
        await queryRunner.query(`
          INSERT INTO "service_translations" (
            "locale",
            "title",
            "slug",
            "short_description",
            "description",
            "meta_title",
            "meta_description",
            "meta_keywords",
            "service_id",
            "created_at",
            "updated_at"
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        `, [
          translation.locale,
          translation.title,
          translation.slug,
          translation.shortDescription,
          translation.description,
          translation.metaTitle,
          translation.metaDescription,
          translation.metaKeywords,
          serviceId
        ]);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`TRUNCATE TABLE "service_translations" CASCADE`);
    await queryRunner.query(`TRUNCATE TABLE "services" CASCADE`);
  }
} 