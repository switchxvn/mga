import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactSection, ContactSectionType } from '../../../../apps/backend/src/modules/contact/entities/contact-section.entity';
import { ContactSectionTranslation } from '../../../../apps/backend/src/modules/contact/entities/contact-section-translation.entity';

@Injectable()
export class ContactSectionSeeder {
  private readonly logger = new Logger(ContactSectionSeeder.name);

  constructor(
    @InjectRepository(ContactSection)
    private readonly sectionRepository: Repository<ContactSection>,
    @InjectRepository(ContactSectionTranslation)
    private readonly sectionTranslationRepository: Repository<ContactSectionTranslation>
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting contact section seeding...');

    // Kiểm tra xem đã có sections chưa
    const existingSections = await this.sectionRepository.count();

    if (existingSections > 0) {
      this.logger.log('Contact sections already exist, skipping seed');
      return;
    }

    try {
      // 1. Hero Section
      this.logger.log('Creating hero section...');
      const heroSection = await this.createSection({
        type: ContactSectionType.HERO,
        componentName: 'ContactHeroSection',
        order: 1,
        settings: {
          layout: 'default',
          heroHeight: '400px',
          heroBackgroundImage: '/images/contact/hero-bg.jpg',
          heroOverlayOpacity: 0.6,
          backgroundColor: '',
          textColor: 'text-white',
          padding: '0',
          animation: {
            enabled: true,
            type: 'fade',
            duration: 1000,
            delay: 0
          }
        }
      }, {
        vi: {
          title: 'Liên Hệ',
          subtitle: 'Chúng tôi luôn sẵn sàng hỗ trợ bạn',
          content: 'Hãy liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi nào'
        },
        en: {
          title: 'Contact Us',
          subtitle: 'We are always ready to assist you',
          content: 'Contact us if you have any questions'
        }
      });

      // 2. Contact Form Section
      this.logger.log('Creating contact form section...');
      const contactFormSection = await this.createSection({
        type: ContactSectionType.CONTACT_FORM,
        componentName: 'ContactFormSection',
        order: 2,
        settings: {
          layout: 'default',
          formLayout: 'default',
          backgroundColor: 'bg-white dark:bg-gray-800',
          textColor: 'text-gray-900 dark:text-white',
          padding: '4rem 0',
          animation: {
            enabled: true,
            type: 'fade-up',
            duration: 1000,
            delay: 200
          },
          formFields: [
            {
              name: 'name',
              label: 'Full Name',
              type: 'text',
              required: true,
              placeholder: 'Enter your full name'
            },
            {
              name: 'email',
              label: 'Email',
              type: 'email',
              required: true,
              placeholder: 'Enter your email'
            },
            {
              name: 'phone',
              label: 'Phone',
              type: 'tel',
              required: true,
              placeholder: 'Enter your phone number'
            },
            {
              name: 'message',
              label: 'Message',
              type: 'textarea',
              required: true,
              placeholder: 'Enter your message'
            }
          ],
          submitButton: {
            text: 'Submit',
            color: 'primary',
            size: 'lg'
          }
        }
      }, {
        vi: {
          title: 'Gửi Tin Nhắn',
          subtitle: 'Điền form bên dưới để liên hệ với chúng tôi',
          content: 'Chúng tôi sẽ phản hồi trong thời gian sớm nhất'
        },
        en: {
          title: 'Send Message',
          subtitle: 'Fill out the form below to contact us',
          content: 'We will respond as soon as possible'
        }
      });

      // 3. Map Section
      this.logger.log('Creating map section...');
      const mapSection = await this.createSection({
        type: ContactSectionType.MAP,
        componentName: 'ContactMapSection',
        order: 3,
        settings: {
          layout: 'default',
          mapHeight: '450px',
          mapLocation: {
            lat: 10.87717,
            lng: 106.699738
          },
          mapZoom: 15,
          mapMarkerTitle: 'XE NẴNG MGA',
          mapMarkerContent: 'Our office location',
          backgroundColor: 'bg-gray-50 dark:bg-gray-900',
          textColor: 'text-gray-900 dark:text-white',
          padding: '0',
          animation: {
            enabled: true,
            type: 'fade-up',
            duration: 1000,
            delay: 200
          }
        }
      }, {
        vi: {
          title: 'Vị Trí Của Chúng Tôi',
          subtitle: 'Tìm đường đến văn phòng của chúng tôi',
          content: 'Chúng tôi nằm ở trung tâm thành phố, dễ dàng tiếp cận'
        },
        en: {
          title: 'Our Location',
          subtitle: 'Find your way to our office',
          content: 'We are located in the city center, easily accessible'
        }
      });

      // 4. Branch Contact Section
      this.logger.log('Creating branch contact section...');
      const branchContactSection = await this.createSection({
        type: ContactSectionType.BRANCH_CONTACT,
        componentName: 'BranchContactSection',
        order: 4,
        settings: {
          layout: 'default',
          branchLayout: 'grid',
          branchColumns: 3,
          backgroundColor: 'bg-white dark:bg-gray-800',
          textColor: 'text-gray-900 dark:text-white',
          padding: '4rem 0',
          animation: {
            enabled: true,
            type: 'fade-up',
            duration: 1000,
            delay: 200
          },
          branches: [
            {
              name: 'Head Office',
              address: '123 Main Street, District 1, Ho Chi Minh City',
              phone: '+84 123 456 789',
              email: 'info@example.com',
              workingHours: 'Mon-Fri: 8:00 AM - 5:00 PM',
              imageUrl: '/images/contact/branch-1.jpg'
            },
            {
              name: 'Branch Office 1',
              address: '456 Second Street, District 2, Ho Chi Minh City',
              phone: '+84 987 654 321',
              email: 'branch1@example.com',
              workingHours: 'Mon-Sat: 9:00 AM - 6:00 PM',
              imageUrl: '/images/contact/branch-2.jpg'
            },
            {
              name: 'Branch Office 2',
              address: '789 Third Street, District 3, Ho Chi Minh City',
              phone: '+84 456 789 123',
              email: 'branch2@example.com',
              workingHours: 'Mon-Fri: 8:30 AM - 5:30 PM',
              imageUrl: '/images/contact/branch-3.jpg'
            }
          ]
        }
      }, {
        vi: {
          title: 'Chi Nhánh Của Chúng Tôi',
          subtitle: 'Ghé thăm các văn phòng của chúng tôi',
          content: 'Chúng tôi có nhiều chi nhánh để phục vụ bạn tốt hơn',
          data: {
            branches: [
              {
                name: 'Văn Phòng Chính',
                address: '123 Đường Chính, Quận 1, TP. Hồ Chí Minh',
                phone: '+84 123 456 789',
                email: 'info@example.com',
                workingHours: 'Thứ 2 - Thứ 6: 8:00 - 17:00'
              },
              {
                name: 'Chi Nhánh 1',
                address: '456 Đường Thứ Hai, Quận 2, TP. Hồ Chí Minh',
                phone: '+84 987 654 321',
                email: 'branch1@example.com',
                workingHours: 'Thứ 2 - Thứ 7: 9:00 - 18:00'
              },
              {
                name: 'Chi Nhánh 2',
                address: '789 Đường Thứ Ba, Quận 3, TP. Hồ Chí Minh',
                phone: '+84 456 789 123',
                email: 'branch2@example.com',
                workingHours: 'Thứ 2 - Thứ 6: 8:30 - 17:30'
              }
            ]
          }
        },
        en: {
          title: 'Our Branches',
          subtitle: 'Visit our offices',
          content: 'We have multiple branches to serve you better',
          data: {
            branches: [
              {
                name: 'Head Office',
                address: '123 Main Street, District 1, Ho Chi Minh City',
                phone: '+84 123 456 789',
                email: 'info@example.com',
                workingHours: 'Mon-Fri: 8:00 AM - 5:00 PM'
              },
              {
                name: 'Branch Office 1',
                address: '456 Second Street, District 2, Ho Chi Minh City',
                phone: '+84 987 654 321',
                email: 'branch1@example.com',
                workingHours: 'Mon-Sat: 9:00 AM - 6:00 PM'
              },
              {
                name: 'Branch Office 2',
                address: '789 Third Street, District 3, Ho Chi Minh City',
                phone: '+84 456 789 123',
                email: 'branch2@example.com',
                workingHours: 'Mon-Fri: 8:30 AM - 5:30 PM'
              }
            ]
          }
        }
      });

      // 5. FAQ Section
      this.logger.log('Creating FAQ section...');
      const faqSection = await this.createSection({
        type: ContactSectionType.FAQ,
        componentName: 'ContactFaqSection',
        order: 5,
        settings: {
          layout: 'default',
          faqLayout: 'accordion',
          backgroundColor: 'bg-gray-50 dark:bg-gray-900',
          textColor: 'text-gray-900 dark:text-white',
          padding: '4rem 0',
          animation: {
            enabled: true,
            type: 'fade-up',
            duration: 1000,
            delay: 200
          },
          faqs: [
            {
              question: 'How can I contact customer service?',
              answer: 'You can contact our customer service team through the contact form on this page, by phone, or by email.'
            },
            {
              question: 'What are your business hours?',
              answer: 'Our main office is open Monday through Friday from 8:00 AM to 5:00 PM. Branch offices may have different hours.'
            },
            {
              question: 'Do you offer emergency support?',
              answer: 'Yes, we offer 24/7 emergency support for critical issues. Please call our emergency hotline for immediate assistance.'
            },
            {
              question: 'How long does it take to get a response?',
              answer: 'We typically respond to all inquiries within 24 hours during business days.'
            }
          ]
        }
      }, {
        vi: {
          title: 'Câu Hỏi Thường Gặp',
          subtitle: 'Tìm câu trả lời cho những câu hỏi phổ biến',
          content: 'Dưới đây là một số câu hỏi thường gặp về dịch vụ của chúng tôi',
          data: {
            faqs: [
              {
                question: 'Làm thế nào để liên hệ với dịch vụ khách hàng?',
                answer: 'Bạn có thể liên hệ với đội ngũ dịch vụ khách hàng của chúng tôi thông qua form liên hệ trên trang này, qua điện thoại hoặc qua email.'
              },
              {
                question: 'Giờ làm việc của bạn là gì?',
                answer: 'Văn phòng chính của chúng tôi mở cửa từ thứ Hai đến thứ Sáu từ 8:00 sáng đến 5:00 chiều. Các chi nhánh có thể có giờ làm việc khác nhau.'
              },
              {
                question: 'Bạn có cung cấp hỗ trợ khẩn cấp không?',
                answer: 'Có, chúng tôi cung cấp hỗ trợ khẩn cấp 24/7 cho các vấn đề quan trọng. Vui lòng gọi đường dây nóng khẩn cấp của chúng tôi để được hỗ trợ ngay lập tức.'
              },
              {
                question: 'Mất bao lâu để nhận được phản hồi?',
                answer: 'Chúng tôi thường phản hồi tất cả các yêu cầu trong vòng 24 giờ trong ngày làm việc.'
              }
            ]
          }
        },
        en: {
          title: 'Frequently Asked Questions',
          subtitle: 'Find answers to common questions',
          content: 'Here are some frequently asked questions about our services',
          data: {
            faqs: [
              {
                question: 'How can I contact customer service?',
                answer: 'You can contact our customer service team through the contact form on this page, by phone, or by email.'
              },
              {
                question: 'What are your business hours?',
                answer: 'Our main office is open Monday through Friday from 8:00 AM to 5:00 PM. Branch offices may have different hours.'
              },
              {
                question: 'Do you offer emergency support?',
                answer: 'Yes, we offer 24/7 emergency support for critical issues. Please call our emergency hotline for immediate assistance.'
              },
              {
                question: 'How long does it take to get a response?',
                answer: 'We typically respond to all inquiries within 24 hours during business days.'
              }
            ]
          }
        }
      });

      // 6. Social Media Section
      this.logger.log('Creating social media section...');
      const socialMediaSection = await this.createSection({
        type: ContactSectionType.SOCIAL_MEDIA,
        componentName: 'ContactSocialMediaSection',
        order: 6,
        settings: {
          layout: 'default',
          socialLayout: 'grid',
          socialColumns: 4,
          backgroundColor: 'bg-white dark:bg-gray-800',
          textColor: 'text-gray-900 dark:text-white',
          padding: '4rem 0',
          animation: {
            enabled: true,
            type: 'fade-up',
            duration: 1000,
            delay: 200
          },
          socialLinks: [
            {
              platform: 'Facebook',
              url: 'https://facebook.com',
              icon: 'facebook',
              color: '#1877F2'
            },
            {
              platform: 'Twitter',
              url: 'https://twitter.com',
              icon: 'twitter',
              color: '#1DA1F2'
            },
            {
              platform: 'Instagram',
              url: 'https://instagram.com',
              icon: 'instagram',
              color: '#E4405F'
            },
            {
              platform: 'LinkedIn',
              url: 'https://linkedin.com',
              icon: 'linkedin',
              color: '#0A66C2'
            }
          ]
        }
      }, {
        vi: {
          title: 'Kết Nối Với Chúng Tôi',
          subtitle: 'Theo dõi chúng tôi trên mạng xã hội',
          content: 'Cập nhật thông tin mới nhất về sản phẩm và dịch vụ của chúng tôi'
        },
        en: {
          title: 'Connect With Us',
          subtitle: 'Follow us on social media',
          content: 'Get the latest updates about our products and services'
        }
      });

      this.logger.log('Contact sections seeded successfully');
    } catch (error) {
      this.logger.error(`Error seeding contact sections: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }

  private async createSection(
    sectionData: Partial<ContactSection>,
    translations: {
      vi: {
        title: string;
        subtitle?: string;
        content?: string;
        data?: Record<string, any>;
      };
      en: {
        title: string;
        subtitle?: string;
        content?: string;
        data?: Record<string, any>;
      };
    }
  ): Promise<ContactSection> {
    // Create section
    const section = this.sectionRepository.create({
      ...sectionData,
      isActive: true
    });
    const savedSection = await this.sectionRepository.save(section);

    // Create translations
    const translationsToSave = [
      {
        sectionId: savedSection.id,
        locale: 'vi',
        ...translations.vi
      },
      {
        sectionId: savedSection.id,
        locale: 'en',
        ...translations.en
      }
    ];

    await this.sectionTranslationRepository.save(translationsToSave);

    return savedSection;
  }
} 