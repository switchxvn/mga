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
    this.logger.log('Starting mail template seeding...')
    try {
      const templates = [
        {
          code: 'TICKET_QR_CODE',
          title: 'E-Ticket QR Code',
          subject: 'Your E-Tickets for {{eventName}}',
          from_email: 'tickets@yourdomain.com',
          from_name: 'Your Company Tickets',
          description: 'Email template for sending QR code tickets to customers',
          variables: {
            customerName: 'Customer full name',
            eventName: 'Name of the event',
            eventDate: 'Date of the event',
            eventTime: 'Time of the event',
            eventLocation: 'Location of the event',
            tickets: 'Array of ticket objects with QR codes'
          },
          html: '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Your E-Tickets</title><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background:#f0f2f5 !important}.wrapper{padding:40px 20px;background:#f0f2f5 !important}.container{max-width:600px;margin:0 auto;background-color:white;border-radius:16px;box-shadow:0 4px 6px rgba(0,0,0,0.1);overflow:hidden}.header{background-color:#1a73e8;color:white;padding:30px;text-align:center}.header h1{margin:0;font-size:24px}.content{padding:40px 30px}.event-info{margin:25px 0;background-color:#f8f9fa;border-radius:12px;padding:25px}.event-info table{width:100%;border-collapse:collapse}.event-info th{text-align:left;padding:12px 0;color:#666;width:35%;font-weight:600}.event-info td{padding:12px 0}.tickets-container{margin:35px 0}.ticket{background-color:#f8f9fa;border-radius:12px;padding:25px;margin-bottom:20px;border:1px solid #e0e0e0}.ticket-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;padding-bottom:15px;border-bottom:1px solid #e0e0e0}.ticket-number{font-size:18px;font-weight:600;color:#1a73e8}.ticket-price{font-size:16px;color:#666}.ticket-qr{text-align:center;margin:20px 0;padding:20px;background:white;border-radius:8px;border:1px solid #e0e0e0}.ticket-qr img{max-width:200px;height:auto;margin:10px 0}.important-note{background-color:#fff3cd;border-radius:12px;padding:25px;margin:25px 0}.important-note ul{margin:15px 0;padding-left:20px}.footer{text-align:center;margin-top:35px;padding:25px;border-top:1px solid #eee;color:#666;font-size:14px}</style></head><body><div class="wrapper"><div class="container"><div class="header"><h1>Your E-Tickets</h1><p>Thank you for your purchase!</p></div><div class="content"><p>Dear {{customerName}},</p><p>Thank you for purchasing tickets to <strong>{{eventName}}</strong>. Below you will find your e-tickets with QR codes.</p><div class="event-info"><table><tr><th>Event</th><td>{{eventName}}</td></tr><tr><th>Date</th><td>{{eventDate}}</td></tr><tr><th>Time</th><td>{{eventTime}}</td></tr><tr><th>Location</th><td>{{eventLocation}}</td></tr></table></div><div class="tickets-container">{{#each tickets}}<div class="ticket"><div class="ticket-header"><div class="ticket-number">Ticket {{ticketNumber}}</div><div class="ticket-price">{{ticketPrice}}</div></div><div class="ticket-qr"><img src="{{qrCodeUrl}}" alt="Ticket QR Code"><p>Please present this QR code at the entrance</p></div></div>{{/each}}</div><div class="important-note"><strong>Important Notes:</strong><ul><li>Please arrive at least 30 minutes before the event</li><li>Each QR code is unique to your ticket - do not share it</li><li>You may be asked to show ID matching the name on the ticket</li></ul></div><div class="footer"><p>Need help? Contact us:</p><p>Email: support@hotro.vn | Phone: 1900 1234</p><p>This is an automated email, please do not reply directly.</p></div></div></div></div></body></html>',
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
            eventName: 'Tên vé',
            eventDate: 'Ngày sử dụng',
            tickets: 'Mảng các đối tượng vé với mã QR'
          },
          html: '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Vé Điện Tử Của Bạn</title><style>body{font-family:Arial,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;background:#f0f2f5 !important}.wrapper{padding:40px 20px;background:#f0f2f5 !important}.container{max-width:600px;margin:0 auto;background-color:white;border-radius:16px;box-shadow:0 4px 6px rgba(0,0,0,0.1);overflow:hidden}.header{background-color:#1a73e8;color:white;padding:30px;text-align:center}.header h1{margin:0;font-size:24px}.content{padding:40px 30px}.event-info{margin:25px 0;background-color:#f8f9fa;border-radius:12px;padding:25px}.event-info table{width:100%;border-collapse:collapse}.event-info th{text-align:left;padding:12px 0;color:#666;width:35%;font-weight:600}.event-info td{padding:12px 0}.tickets-container{margin:35px 0}.ticket{background-color:#f8f9fa;border-radius:12px;padding:25px;margin-bottom:20px;border:1px solid #e0e0e0}.ticket-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;padding-bottom:15px;border-bottom:1px solid #e0e0e0;min-height:40px}.ticket-number{font-size:16px;font-weight:600;color:#1a73e8;display:flex;align-items:center;flex:1;height:100%}.ticket-price{font-size:16px;font-weight:600;color:#34a853;background:#e8f5e9;padding:8px 16px;border-radius:20px;display:flex;align-items:center;justify-content:flex-end;margin-left:auto;white-space:nowrap}.ticket-qr{text-align:center;margin:20px 0;padding:20px;background:white;border-radius:8px;border:1px solid #e0e0e0}.ticket-qr img{width:200px;height:200px;margin:10px 0}.important-note{background-color:#fff3cd;border-radius:12px;padding:25px;margin:25px 0}.important-note ul{margin:15px 0;padding-left:20px}.footer{text-align:center;margin-top:35px;padding:25px;border-top:1px solid #eee;color:#666;font-size:14px}</style></head><body><div class="wrapper"><div class="container"><div class="header"><h1>Vé Điện Tử Của Bạn</h1><p>Cảm ơn bạn đã đặt vé!</p></div><div class="content"><p>Kính gửi {{customerName}},</p><p>Cảm ơn bạn đã mua vé <strong>{{eventName}}</strong>.</p><div class="event-info"><table><tr><th>Vé</th><td>{{eventName}}</td></tr><tr><th>Ngày sử dụng</th><td>{{eventDate}}</td></tr><tr><th>Địa điểm</th><td>Đường Châu Thị Tế, khóm Vĩnh Tây 3, Châu Đốc, An Giang, Vietnam</td></tr></table></div><div class="tickets-container">{{#each tickets}}<div class="ticket"><div class="ticket-header"><div class="ticket-number">Loại vé: {{this.ticketNumber}}</div><div class="ticket-price">{{this.ticketPrice}}</div></div><div class="ticket-qr"><img src="{{this.qrCodeUrl}}" alt="Mã QR Vé"><p>Vui lòng xuất trình mã QR này tại cổng vào</p></div></div>{{/each}}</div><div class="important-note"><strong>Lưu ý quan trọng:</strong><ul><li>Vui lòng đến trước ít nhất 30 phút</li><li>Mỗi mã QR là duy nhất cho từng vé - không chia sẻ với người khác</li><li>Bạn có thể được yêu cầu xuất trình CMND/CCCD trùng khớp với tên trên vé</li></ul></div><div class="footer"><p>Cần hỗ trợ? Liên hệ với chúng tôi:</p><p>Email: support@hotro.vn | Điện thoại: 1900 1234</p><p>Đây là email tự động, vui lòng không trả lời trực tiếp.</p></div></div></div></div></body></html>',
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