import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../../../../apps/backend/src/modules/service/entities/service.entity';
@Injectable()
export class ServiceSeeder {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  async seed(): Promise<void> {
    const count = await this.serviceRepository.count();
    if (count > 0) {
      return; // Đã có dữ liệu, không cần seed
    }

    const services = [
      {
        title: 'Hiệu suất cao',
        description: 'Được xây dựng với Nuxt 3 và NestJS, ứng dụng cung cấp hiệu suất tối ưu và thời gian phản hồi nhanh.',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>',
        order: 1,
        isActive: true,
      },
      {
        title: 'Bảo mật',
        description: 'Hệ thống xác thực và phân quyền mạnh mẽ, bảo vệ dữ liệu người dùng và nội dung.',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>',
        order: 2,
        isActive: true,
      },
      {
        title: 'Thiết kế hiện đại',
        description: 'Giao diện người dùng trực quan, đáp ứng và dễ sử dụng trên mọi thiết bị.',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>',
        order: 3,
        isActive: true,
      },
      {
        title: 'Tích hợp API',
        description: 'Tích hợp dễ dàng với các API bên thứ ba và hệ thống khác thông qua tRPC.',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>',
        order: 4,
        isActive: true,
      },
      {
        title: 'Quản lý nội dung',
        description: 'Hệ thống quản lý nội dung linh hoạt, dễ dàng tạo và chỉnh sửa bài viết.',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>',
        order: 5,
        isActive: true,
      },
      {
        title: 'Đa ngôn ngữ',
        description: 'Hỗ trợ đa ngôn ngữ, dễ dàng mở rộng và thêm ngôn ngữ mới.',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>',
        order: 6,
        isActive: true,
      },
    ];

    for (const serviceData of services) {
      const service = this.serviceRepository.create(serviceData);
      await this.serviceRepository.save(service);
    }
  }
} 