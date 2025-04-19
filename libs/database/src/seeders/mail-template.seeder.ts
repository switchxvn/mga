import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailTemplate } from '../../../../apps/backend/src/modules/mail/entities/mail-template.entity';

@Injectable()
export class MailTemplateSeeder {
  private readonly logger = new Logger(MailTemplateSeeder.name);

  constructor(
    @InjectRepository(MailTemplate)
    private readonly mailTemplateRepository: Repository<MailTemplate>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting mail template seeding...');

    try {
      const templates = [
        {
          code: 'TICKET_QR_CODE',
          title: 'E-Ticket QR Code',
          subject: 'Your E-Ticket for {{eventName}}',
          from_email: 'tickets@yourdomain.com',
          from_name: 'Your Company Tickets',
          description: 'Email template for sending QR code tickets to customers',
          variables: {
            customerName: 'Customer full name',
            eventName: 'Name of the event',
            eventDate: 'Date of the event',
            eventTime: 'Time of the event',
            eventLocation: 'Location of the event',
            ticketType: 'Type of ticket',
            ticketPrice: 'Price of the ticket',
            ticketNumber: 'Unique ticket number',
            qrCodeUrl: 'URL to the QR code image',
            venueAddress: 'Full venue address',
            supportEmail: 'Support email address',
            supportPhone: 'Support phone number'
          },
          html: '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Your E-Ticket</title><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0}.container{max-width:600px;margin:0 auto;padding:20px}.header{background-color:#1a73e8;color:white;padding:20px;text-align:center}.ticket-info{background-color:#f8f9fa;border-radius:8px;padding:20px;margin:20px 0}.qr-code{text-align:center;margin:30px 0}.qr-code img{max-width:200px;height:auto}.important-note{background-color:#fff3cd;border-left:4px solid #ffc107;padding:15px;margin:20px 0}.footer{text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #eee;font-size:12px;color:#666}</style></head><body><div class="container"><div class="header"><h1>Your E-Ticket</h1><p>Thank you for your purchase!</p></div><p>Dear {{customerName}},</p><p>Thank you for purchasing tickets to <strong>{{eventName}}</strong>. Below you will find your e-ticket with QR code.</p><div class="ticket-info"><table><tr><th>Event</th><td>{{eventName}}</td></tr><tr><th>Date</th><td>{{eventDate}}</td></tr><tr><th>Time</th><td>{{eventTime}}</td></tr><tr><th>Location</th><td>{{eventLocation}}</td></tr><tr><th>Ticket Type</th><td>{{ticketType}}</td></tr><tr><th>Ticket Number</th><td>{{ticketNumber}}</td></tr></table></div><div class="qr-code"><h3>Your QR Code Ticket</h3><img src="{{qrCodeUrl}}" alt="Ticket QR Code"><p>Please present this QR code at the entrance</p></div><div class="important-note"><strong>Important Notes:</strong><ul><li>Please arrive at least 30 minutes before the event</li><li>This QR code is unique to your ticket - do not share it</li><li>You may be asked to show ID matching the name on the ticket</li></ul></div><div class="venue-info"><h3>Venue Information</h3><p>{{venueAddress}}</p></div><div class="footer"><p>Need help? Contact us:</p><p>Email: {{supportEmail}} | Phone: {{supportPhone}}</p><p>This is an automated email, please do not reply directly.</p></div></div></body></html>',
          is_active: true
        },
        {
          code: 'TICKET_QR_CODE_VI',
          title: 'Vé Điện Tử QR Code',
          subject: 'Vé Điện Tử của bạn cho {{eventName}}',
          from_email: 'tickets@yourdomain.com',
          from_name: 'Your Company Tickets',
          description: 'Mẫu email gửi vé QR code cho khách hàng',
          variables: {
            customerName: 'Tên đầy đủ khách hàng',
            eventName: 'Tên sự kiện',
            eventDate: 'Ngày diễn ra',
            eventTime: 'Thời gian diễn ra',
            eventLocation: 'Địa điểm tổ chức',
            ticketType: 'Loại vé',
            ticketPrice: 'Giá vé',
            ticketNumber: 'Số vé',
            qrCodeUrl: 'Đường dẫn mã QR',
            venueAddress: 'Địa chỉ đầy đủ',
            supportEmail: 'Email hỗ trợ',
            supportPhone: 'Số điện thoại hỗ trợ'
          },
          html: '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Vé Điện Tử Của Bạn</title><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0}.container{max-width:600px;margin:0 auto;padding:20px}.header{background-color:#1a73e8;color:white;padding:20px;text-align:center}.ticket-info{background-color:#f8f9fa;border-radius:8px;padding:20px;margin:20px 0}.qr-code{text-align:center;margin:30px 0}.qr-code img{max-width:200px;height:auto}.important-note{background-color:#fff3cd;border-left:4px solid #ffc107;padding:15px;margin:20px 0}.footer{text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid #eee;font-size:12px;color:#666}</style></head><body><div class="container"><div class="header"><h1>Vé Điện Tử Của Bạn</h1><p>Cảm ơn bạn đã đặt vé!</p></div><p>Kính gửi {{customerName}},</p><p>Cảm ơn bạn đã mua vé cho sự kiện <strong>{{eventName}}</strong>. Dưới đây là vé điện tử kèm mã QR của bạn.</p><div class="ticket-info"><table><tr><th>Sự kiện</th><td>{{eventName}}</td></tr><tr><th>Ngày</th><td>{{eventDate}}</td></tr><tr><th>Thời gian</th><td>{{eventTime}}</td></tr><tr><th>Địa điểm</th><td>{{eventLocation}}</td></tr><tr><th>Loại vé</th><td>{{ticketType}}</td></tr><tr><th>Số vé</th><td>{{ticketNumber}}</td></tr></table></div><div class="qr-code"><h3>Mã QR Vé Của Bạn</h3><img src="{{qrCodeUrl}}" alt="Mã QR Vé"><p>Vui lòng xuất trình mã QR này tại cổng vào</p></div><div class="important-note"><strong>Lưu ý quan trọng:</strong><ul><li>Vui lòng đến trước ít nhất 30 phút</li><li>Mã QR này là duy nhất cho vé của bạn - không chia sẻ với người khác</li><li>Bạn có thể được yêu cầu xuất trình CMND/CCCD trùng khớp với tên trên vé</li></ul></div><div class="venue-info"><h3>Thông Tin Địa Điểm</h3><p>{{venueAddress}}</p></div><div class="footer"><p>Cần hỗ trợ? Liên hệ với chúng tôi:</p><p>Email: {{supportEmail}} | Điện thoại: {{supportPhone}}</p><p>Đây là email tự động, vui lòng không trả lời trực tiếp.</p></div></div></body></html>',
          is_active: true
        }
      ];

      for (const template of templates) {
        const existingTemplate = await this.mailTemplateRepository.findOne({
          where: { code: template.code }
        });

        if (existingTemplate) {
          this.logger.log(`Mail template for ${template.code} already exists, skipping...`);
          continue;
        }

        const savedTemplate = await this.mailTemplateRepository.save(template);
        this.logger.log(
          `Created mail template for ${savedTemplate.code} with ID: ${savedTemplate.id}`
        );
      }

      this.logger.log('Mail templates seeded successfully');
    } catch (error) {
      this.logger.error(`Error seeding mail templates: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }
} 