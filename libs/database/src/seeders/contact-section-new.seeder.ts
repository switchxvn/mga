import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactSection, ContactSectionType } from '../../../../apps/backend/src/modules/contact/entities/contact-section.entity';
import { ContactSectionTranslation } from '../../../../apps/backend/src/modules/contact/entities/contact-section-translation.entity';

@Injectable()
export class ContactSectionNewSeeder {
  private readonly logger = new Logger(ContactSectionNewSeeder.name);

  constructor(
    @InjectRepository(ContactSection)
    private readonly sectionRepository: Repository<ContactSection>,
    @InjectRepository(ContactSectionTranslation)
    private readonly sectionTranslationRepository: Repository<ContactSectionTranslation>
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting contact section seeding...');

    const existingSections = await this.sectionRepository.count();

    if (existingSections > 0) {
      this.logger.log('Contact sections already exist, skipping seed');
      return;
    }

    try {
      // 1. Contact Form Section
      this.logger.log('Creating contact form section...');
      const contactFormSection = await this.createSection({
        type: ContactSectionType.CONTACT_FORM,
        componentName: 'ContactFormSection',
        order: 1,
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
              label: 'Họ tên',
              type: 'text',
              required: true,
              placeholder: 'Nhập họ tên của bạn'
            },
            {
              name: 'email',
              label: 'Email',
              type: 'email',
              required: true,
              placeholder: 'Nhập email của bạn'
            },
            {
              name: 'phone',
              label: 'Số điện thoại',
              type: 'tel',
              required: true,
              placeholder: 'Nhập số điện thoại của bạn'
            },
            {
              name: 'message',
              label: 'Lời nhắn',
              type: 'textarea',
              required: true,
              placeholder: 'Nhập lời nhắn của bạn'
            }
          ],
          submitButton: {
            text: 'Gửi',
            color: 'primary',
            size: 'lg'
          }
        }
      }, {
        vi: {
          title: 'Yêu cầu tư vấn',
          subtitle: 'Điền form bên dưới để liên hệ với chúng tôi',
          content: 'Chúng tôi sẽ phản hồi trong thời gian sớm nhất'
        },
        en: {
          title: 'Request Consultation',
          subtitle: 'Fill out the form below to contact us',
          content: 'We will respond as soon as possible'
        }
      });

      // 2. Branch Contact Section
      this.logger.log('Creating branch contact section...');
      const branchContactSection = await this.createSection({
        type: ContactSectionType.BRANCH_CONTACT,
        componentName: 'BranchContactSection',
        order: 2,
        settings: {
          layout: 'default',
          branchLayout: 'grid',
          backgroundColor: 'bg-gray-50 dark:bg-gray-900',
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
              name: 'TRỤ SỞ CHÍNH - VĂN PHÒNG',
              address: 'Lầu 7, số 60 Nguyễn Văn Thủ, Phường Đa Kao, Quận 1, Thành phố Hồ Chí Minh',
              contacts: [
                {
                  label: 'Hotline (Mr Thông)',
                  value: '0917 001 254',
                  type: 'phone'
                },
                {
                  label: 'Email',
                  value: 'thong@mgavietnam.com',
                  type: 'email'
                }
              ]
            },
            {
              name: 'CHI NHÁNH MIỀN BẮC - HÀ NỘI',
              address: '989 Nguyễn Đức thuận, Trâu Quỳ, Gia Lâm, Hà Nội',
              contacts: [
                {
                  label: 'Hotline (Mr Đạo)',
                  value: '0917 004 628',
                  type: 'phone'
                },
                {
                  label: 'Email',
                  value: 'dao@mgavietnam.com',
                  type: 'email'
                },
                {
                  label: 'Hotline Mr Hùng (chuyên viên xe nâng)',
                  value: '0945 533 840',
                  type: 'phone'
                },
                {
                  label: 'Email',
                  value: 'ngvhung@mgavietnam.com',
                  type: 'email'
                },
                {
                  label: 'Hotline Ms. Hoàng Nhâm (chuyên viên xe nâng)',
                  value: '0917 001 728',
                  type: 'phone'
                },
                {
                  label: 'Email',
                  value: 'hoangnham@mgavietnam.com',
                  type: 'email'
                }
              ]
            },
            {
              name: 'NHÀ MÁY LẮP RÁP SKD',
              address: '37/6 khu Phố Tây, Phường Vĩnh Phú, Thị Xã Thuận An, Tỉnh Bình Dương',
              contacts: [
                {
                  label: 'Hotline (Mr Thông)',
                  value: '0917 001 254',
                  type: 'phone'
                },
                {
                  label: 'Fax',
                  value: '0274.6547200',
                  type: 'phone'
                },
                {
                  label: 'Email',
                  value: 'thong@mgavietnam.com',
                  type: 'email'
                }
              ]
            },
            {
              name: 'CHI NHÁNH MIỀN NAM - BÌNH DƯƠNG',
              address: '1/1B Khu phố Hòa Long, Phường Lái Thiêu, Thị xã Thuận An, Tỉnh Bình Dương',
              contacts: [
                {
                  label: 'Mr Thông',
                  value: '0917001254',
                  type: 'phone'
                },
                {
                  label: 'Ms Thư',
                  value: '0931531637',
                  type: 'phone'
                },
                {
                  label: 'Mr Công',
                  value: '0917 001 733',
                  type: 'phone'
                },
                {
                  label: 'Mr Trọng',
                  value: '0908522924',
                  type: 'phone'
                },
                {
                  label: 'Email',
                  value: 'admin@mgavietnam.com',
                  type: 'email'
                }
              ]
            }
          ]
        }
      }, {
        vi: {
          title: 'Liên hệ công ty MGA Việt Nam',
          subtitle: 'Các chi nhánh của chúng tôi',
          content: 'Liên hệ với chúng tôi tại các chi nhánh'
        },
        en: {
          title: 'Contact MGA Vietnam Company',
          subtitle: 'Our Branches',
          content: 'Contact us at our branches'
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
    const section = this.sectionRepository.create({
      ...sectionData,
      isActive: true
    });
    const savedSection = await this.sectionRepository.save(section);

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