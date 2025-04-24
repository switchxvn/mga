import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderTicketSection, OrderTicketSectionType } from '../../../../apps/backend/src/modules/order-ticket/entities/order-ticket-section.entity';
import { OrderTicketSectionTranslation } from '../../../../apps/backend/src/modules/order-ticket/entities/order-ticket-section-translation.entity';

// Define types to match component props
interface BannerSlide {
  backgroundImage: string;
  title?: string;
  subtitle?: string;
  content?: string;
  buttonText?: string;
  buttonLink?: string;
}

interface BaseSettings {
  backgroundColor?: string;
  textColor?: string;
}

interface BannerSettings extends BaseSettings {
  padding?: string;
  animation?: {
    enabled: boolean;
    type: string;
    duration: number;
    delay: number;
  };
  slides?: BannerSlide[];
  swiperOptions?: {
    autoplay?: boolean;
    delay?: number;
    effect?: 'slide' | 'fade';
    loop?: boolean;
  };
  overlayColor?: string;
  overlayOpacity?: number;
  defaultButtonText?: string;
  defaultButtonLink?: string;
}

interface IntroduceSettings extends BaseSettings {
  imageUrl?: string;
}

interface OrderSettings extends BaseSettings {
  accentColor?: string;
}

type SectionSettings = BannerSettings | IntroduceSettings | OrderSettings;

interface SectionTranslation {
  locale: string;
  title: string;
  subtitle: string;
  content?: string;
  data?: {
    ticketTypes?: Array<{
      id: string;
      name: string;
      price: number;
      description?: string;
    }>;
    formLabels?: {
      name?: string;
      email?: string;
      phone?: string;
      quantity?: string;
      ticketType?: string;
      submit?: string;
    };
  };
}

interface SectionData {
  type: OrderTicketSectionType;
  componentName: string;
  order: number;
  isActive: boolean;
  settings: SectionSettings;
  translations: SectionTranslation[];
}

@Injectable()
export class OrderTicketSectionSeeder {
  private readonly logger = new Logger(OrderTicketSectionSeeder.name);

  constructor(
    @InjectRepository(OrderTicketSection)
    private readonly orderTicketSectionRepository: Repository<OrderTicketSection>,
    @InjectRepository(OrderTicketSectionTranslation)
    private readonly orderTicketSectionTranslationRepository: Repository<OrderTicketSectionTranslation>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting order ticket section seeding...');

    try {
      // Define order ticket sections
      const sections: SectionData[] = [
        {
          type: OrderTicketSectionType.BANNER,
          componentName: 'OrderTicketBannerSection',
          order: 1,
          isActive: true,
          settings: {
            backgroundColor: 'bg-primary/5',
            textColor: 'text-gray-900',
            padding: '0',
            animation: {
              enabled: true,
              type: 'fade-up',
              duration: 1000,
              delay: 200
            },
            slides: [
              {
                backgroundImage: '/images/ticket-banner.jpg',
                title: 'Get Your Event Tickets',
                subtitle: 'Book your tickets for our upcoming events',
                buttonText: 'Book Now',
                buttonLink: '#ticket-order'
              }
            ],
            overlayColor: 'bg-black',
            overlayOpacity: 0.4
          },
          translations: [
            {
              locale: 'en',
              title: 'Get Your Event Tickets',
              subtitle: 'Book your tickets for our upcoming events',
              content: '<p>Join us for an unforgettable experience. Early bird tickets available now!</p>'
            },
            {
              locale: 'vi',
              title: 'Đặt Vé Sự Kiện',
              subtitle: 'Đặt vé cho các sự kiện sắp tới của chúng tôi',
              content: '<p>Tham gia cùng chúng tôi để có những trải nghiệm đáng nhớ. Vé ưu đãi đang có sẵn!</p>'
            }
          ]
        },
        {
          type: OrderTicketSectionType.INTRODUCE,
          componentName: 'OrderTicketIntroduceSection',
          order: 2,
          isActive: true,
          settings: {
            backgroundColor: 'bg-white',
            textColor: 'text-gray-900',
            imageUrl: '/images/ticket-intro.jpg'
          },
          translations: [
            {
              locale: 'en',
              title: 'Why Choose Our Events?',
              subtitle: 'Experience the difference with our premium events',
              content: '<ul><li>Premium venues and locations</li><li>Professional event management</li><li>Exclusive performances and shows</li><li>Memorable experiences guaranteed</li></ul>'
            },
            {
              locale: 'vi',
              title: 'Tại Sao Chọn Sự Kiện Của Chúng Tôi?',
              subtitle: 'Trải nghiệm sự khác biệt với các sự kiện cao cấp của chúng tôi',
              content: '<ul><li>Địa điểm và không gian cao cấp</li><li>Quản lý sự kiện chuyên nghiệp</li><li>Các buổi biểu diễn và show độc quyền</li><li>Đảm bảo những trải nghiệm đáng nhớ</li></ul>'
            }
          ]
        },
        {
          type: OrderTicketSectionType.TICKET_ORDER,
          componentName: 'OrderTicketOrderSection',
          order: 3,
          isActive: true,
          settings: {
            backgroundColor: 'bg-gray-50',
            textColor: 'text-gray-900',
            accentColor: 'primary'
          },
          translations: [
            {
              locale: 'en',
              title: 'Book Your Tickets',
              subtitle: 'Select your preferred ticket package',
              data: {
                ticketTypes: [
                  {
                    id: 'standard',
                    name: 'Standard Ticket',
                    price: 99.99,
                    description: 'Access to main event areas and standard amenities'
                  },
                  {
                    id: 'vip',
                    name: 'VIP Experience',
                    price: 199.99,
                    description: 'Premium access with exclusive benefits and VIP areas'
                  }
                ],
                formLabels: {
                  name: 'Full Name',
                  email: 'Email Address',
                  phone: 'Phone Number',
                  quantity: 'Number of Tickets',
                  ticketType: 'Select Ticket Type',
                  submit: 'Complete Order'
                }
              }
            },
            {
              locale: 'vi',
              title: 'Đặt Vé',
              subtitle: 'Chọn gói vé phù hợp với bạn',
              data: {
                ticketTypes: [
                  {
                    id: 'standard',
                    name: 'Vé Tiêu Chuẩn',
                    price: 99.99,
                    description: 'Truy cập khu vực sự kiện chính và tiện ích tiêu chuẩn'
                  },
                  {
                    id: 'vip',
                    name: 'Trải Nghiệm VIP',
                    price: 199.99,
                    description: 'Quyền truy cập cao cấp với các đặc quyền độc quyền và khu vực VIP'
                  }
                ],
                formLabels: {
                  name: 'Họ và Tên',
                  email: 'Địa Chỉ Email',
                  phone: 'Số Điện Thoại',
                  quantity: 'Số Lượng Vé',
                  ticketType: 'Chọn Loại Vé',
                  submit: 'Hoàn Tất Đặt Vé'
                }
              }
            }
          ]
        }
      ];

      for (const sectionData of sections) {
        // Check if section exists
        const existingSection = await this.orderTicketSectionRepository.findOne({
          where: { type: sectionData.type }
        });

        if (existingSection) {
          this.logger.log(`Order ticket section for ${sectionData.type} already exists, skipping...`);
          continue;
        }

        // Extract translations from section data
        const { translations, ...sectionWithoutTranslations } = sectionData;

        // Save the section without translations first
        const savedSection = await this.orderTicketSectionRepository.save(sectionWithoutTranslations as OrderTicketSection);

        // Save translations separately
        for (const translation of translations) {
          const translationEntity = this.orderTicketSectionTranslationRepository.create({
            sectionId: savedSection.id,
            locale: translation.locale,
            title: translation.title,
            subtitle: translation.subtitle,
            content: translation.content,
            data: translation.data,
            section: savedSection
          });

          await this.orderTicketSectionTranslationRepository.save(translationEntity);
        }

        this.logger.log(`Created order ticket section for ${savedSection.type} with ID: ${savedSection.id}`);
      }

      this.logger.log('Order ticket sections seeded successfully');
    } catch (error) {
      this.logger.error(`Error seeding order ticket sections: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }
} 