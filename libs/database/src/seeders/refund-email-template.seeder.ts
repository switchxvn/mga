import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailTemplate } from '../../../../apps/backend/src/modules/mail/entities/mail-template.entity';

@Injectable()
export class RefundEmailTemplateSeeder {
  private readonly logger = new Logger(RefundEmailTemplateSeeder.name);

  constructor(
    @InjectRepository(MailTemplate)
    private readonly mailTemplateRepository: Repository<MailTemplate>,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Starting refund email template seeding...')
    try {
      const templates = [
        {
          code: 'REFUND_REQUEST',
          title: 'Refund Request Confirmation',
          subject: 'Confirmation of Your Refund Request for Order #{{orderCode}}',
          from_email: 'support@yourdomain.com',
          from_name: 'Customer Support',
          description: 'Email template for confirming refund requests',
          variables: {
            customerName: 'Customer full name',
            orderCode: 'Order reference code',
            refundCode: 'Refund reference code',
            refundType: 'Type of refund requested',
            refundAmount: 'Amount to be refunded (if applicable)'
          },
          html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Refund Request Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background: #f0f2f5 !important;
        }
        .wrapper {
            padding: 40px 20px;
            background: #f0f2f5 !important;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 16px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background-color: #1a73e8;
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 40px 30px;
        }
        .info-box {
            margin: 25px 0;
            background-color: #f8f9fa;
            border-radius: 12px;
            padding: 25px;
        }
        .info-box table {
            width: 100%;
            border-collapse: collapse;
        }
        .info-box th {
            text-align: left;
            padding: 12px 0;
            color: #666;
            width: 35%;
            font-weight: 600;
        }
        .info-box td {
            padding: 12px 0;
        }
        .action-link {
            display: block;
            text-align: center;
            margin: 25px 0;
            padding: 12px 24px;
            background-color: #1a73e8;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
        }
        .action-link:hover {
            background-color: #1557b0;
        }
        .note-box {
            background-color: #fff3cd;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        .footer {
            text-align: center;
            margin-top: 35px;
            padding: 25px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1>Refund Request Confirmation</h1>
            </div>
            <div class="content">
                <p>Dear {{customerName}},</p>
                <p>We have received your refund request for order <strong>#{{orderCode}}</strong>. Your request is being processed.</p>
                
                <div class="info-box">
                    <h3>Refund Details</h3>
                    <table>
                        <tr>
                            <th>Order Number</th>
                            <td>#{{orderCode}}</td>
                        </tr>
                        <tr>
                            <th>Refund Reference</th>
                            <td>#{{refundCode}}</td>
                        </tr>
                        <tr>
                            <th>Request Type</th>
                            <td>{{refundType}}</td>
                        </tr>
                        {{#if refundAmount}}
                        <tr>
                            <th>Amount</th>
                            <td>{{refundAmount}}</td>
                        </tr>
                        {{/if}}
                    </table>
                </div>
                
                <p>Your refund request has been registered in our system and is currently being reviewed by our team. Please keep your refund reference number for future inquiries.</p>
                
                <div class="note-box">
                    <h3>What Happens Next?</h3>
                    <p>Our team will review your request within 3-5 business days. We will notify you once your refund request has been processed.</p>
                    <p>If additional information is needed, we will contact you directly.</p>
                </div>
                
                <div class="footer">
                    <p>Need help? Contact us:</p>
                    <p>Email: admin@hmgavietnam.com | Phone: 0869.519.679</p>
                    <p>This is an automated email, please do not reply directly.</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`,
          is_active: true
        },
        {
          code: 'REFUND_REQUEST_VI',
          title: 'Xác Nhận Yêu Cầu Hoàn Trả',
          subject: 'Xác nhận yêu cầu hoàn trả đơn hàng #{{orderCode}}',
          from_email: 'support@yourdomain.com',
          from_name: 'Hỗ Trợ Khách Hàng',
          description: 'Mẫu email xác nhận yêu cầu hoàn trả',
          variables: {
            customerName: 'Tên đầy đủ khách hàng',
            orderCode: 'Mã đơn hàng',
            refundCode: 'Mã yêu cầu hoàn trả',
            refundType: 'Loại hoàn trả đã yêu cầu',
            refundAmount: 'Số tiền được hoàn trả (nếu có)'
          },
          html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xác Nhận Yêu Cầu Hoàn Trả</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background: #f0f2f5 !important;
        }
        .wrapper {
            padding: 40px 20px;
            background: #f0f2f5 !important;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 16px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background-color: #1a73e8;
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 40px 30px;
        }
        .info-box {
            margin: 25px 0;
            background-color: #f8f9fa;
            border-radius: 12px;
            padding: 25px;
        }
        .info-box table {
            width: 100%;
            border-collapse: collapse;
        }
        .info-box th {
            text-align: left;
            padding: 12px 0;
            color: #666;
            width: 35%;
            font-weight: 600;
        }
        .info-box td {
            padding: 12px 0;
        }
        .action-link {
            display: block;
            text-align: center;
            margin: 25px 0;
            padding: 12px 24px;
            background-color: #1a73e8;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
        }
        .action-link:hover {
            background-color: #1557b0;
        }
        .note-box {
            background-color: #fff3cd;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        .footer {
            text-align: center;
            margin-top: 35px;
            padding: 25px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1>Xác Nhận Yêu Cầu Hoàn Trả</h1>
            </div>
            <div class="content">
                <p>Kính gửi {{customerName}},</p>
                <p>Chúng tôi đã nhận được yêu cầu hoàn trả cho đơn hàng <strong>#{{orderCode}}</strong>. Yêu cầu của bạn đang được xử lý.</p>
                
                <div class="info-box">
                    <h3>Chi Tiết Hoàn Trả</h3>
                    <table>
                        <tr>
                            <th>Mã Đơn Hàng</th>
                            <td>#{{orderCode}}</td>
                        </tr>
                        <tr>
                            <th>Mã Hoàn Trả</th>
                            <td>#{{refundCode}}</td>
                        </tr>
                        <tr>
                            <th>Loại Yêu Cầu</th>
                            <td>{{#eq refundType "MONEY_REFUND"}}Hoàn tiền{{/eq}}{{#eq refundType "RESCHEDULE"}}Đổi ngày{{/eq}}{{#eq refundType "PRODUCT_EXCHANGE"}}Đổi sản phẩm{{/eq}}{{#eq refundType "STORE_CREDIT"}}Đổi sang credits{{/eq}}</td>
                        </tr>
                        {{#if refundAmount}}
                        <tr>
                            <th>Số Tiền</th>
                            <td>{{refundAmount}} VNĐ</td>
                        </tr>
                        {{/if}}
                    </table>
                </div>
                
                <p>Yêu cầu hoàn trả của bạn đã được ghi nhận trong hệ thống của chúng tôi và đang được đội ngũ nhân viên xem xét. Vui lòng giữ lại mã hoàn trả để tra cứu sau này.</p>
                
                <div class="note-box">
                    <h3>Các Bước Tiếp Theo</h3>
                    <p>Đội ngũ của chúng tôi sẽ xem xét yêu cầu của bạn trong vòng 3-5 ngày làm việc. Chúng tôi sẽ thông báo cho bạn khi yêu cầu hoàn trả được xử lý.</p>
                    <p>Nếu cần thêm thông tin, chúng tôi sẽ liên hệ trực tiếp với bạn.</p>
                </div>
                
                <div class="footer">
                    <p>Cần hỗ trợ? Liên hệ với chúng tôi:</p>
                    <p>Email: admin@hmgavietnam.com | Điện thoại: 0869.519.679</p>
                    <p>Đây là email tự động, vui lòng không trả lời trực tiếp.</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`,
          is_active: true
        },
        {
          code: 'TICKET_EXCHANGE_VI',
          title: 'Xác Nhận Yêu Cầu Đổi Vé',
          subject: 'Xác nhận yêu cầu đổi ngày sử dụng vé - Đơn hàng #{{orderCode}}',
          from_email: 'support@yourdomain.com',
          from_name: 'Hỗ Trợ Khách Hàng',
          description: 'Mẫu email xác nhận yêu cầu đổi ngày sử dụng vé',
          variables: {
            customerName: 'Tên đầy đủ khách hàng',
            orderCode: 'Mã đơn hàng',
            refundCode: 'Mã yêu cầu đổi vé',
            ticketDetails: 'Chi tiết về vé đổi ngày',
            oldDate: 'Ngày cũ',
            newDate: 'Ngày mới'
          },
          html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xác Nhận Yêu Cầu Đổi Vé</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background: #f0f2f5 !important;
        }
        .wrapper {
            padding: 40px 20px;
            background: #f0f2f5 !important;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            border-radius: 16px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background-color: #1a73e8;
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 40px 30px;
        }
        .info-box {
            margin: 25px 0;
            background-color: #f8f9fa;
            border-radius: 12px;
            padding: 25px;
        }
        .info-box table {
            width: 100%;
            border-collapse: collapse;
        }
        .info-box th {
            text-align: left;
            padding: 12px 0;
            color: #666;
            width: 35%;
            font-weight: 600;
        }
        .info-box td {
            padding: 12px 0;
        }
        .action-link {
            display: block;
            text-align: center;
            margin: 25px 0;
            padding: 12px 24px;
            background-color: #1a73e8;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
        }
        .action-link:hover {
            background-color: #1557b0;
        }
        .ticket-item {
            padding: 15px;
            border-bottom: 1px solid #eee;
        }
        .ticket-item:last-child {
            border-bottom: none;
        }
        .date-change {
            margin-top: 8px;
            color: #0066cc;
            font-weight: 500;
        }
        .note-box {
            background-color: #e6f7ff;
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
            border-left: 4px solid #1890ff;
        }
        .footer {
            text-align: center;
            margin-top: 35px;
            padding: 25px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1>Xác Nhận Yêu Cầu Đổi Vé</h1>
            </div>
            <div class="content">
                <p>Kính gửi {{customerName}},</p>
                <p>Chúng tôi đã nhận được yêu cầu đổi ngày sử dụng vé cho đơn hàng <strong>#{{orderCode}}</strong>. Yêu cầu của bạn đang được xử lý.</p>
                
                <div class="info-box">
                    <h3>Chi Tiết Yêu Cầu Đổi Vé</h3>
                    <table>
                        <tr>
                            <th>Mã Đơn Hàng</th>
                            <td>#{{orderCode}}</td>
                        </tr>
                        <tr>
                            <th>Mã Yêu Cầu</th>
                            <td>#{{refundCode}}</td>
                        </tr>
                        <tr>
                            <th>Loại Yêu Cầu</th>
                            <td>Đổi ngày sử dụng vé</td>
                        </tr>
                    </table>
                    
                    {{#if items}}
                    <h4 style="margin-top: 20px; margin-bottom: 10px;">Thông tin vé được đổi</h4>
                    <div style="border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                        {{#each items}}
                        <div class="ticket-item">
                            <div><strong>{{productName}}</strong> {{#if variantName}}({{variantName}}){{/if}}</div>
                            <div>Số lượng: {{quantity}}</div>
                            <div class="date-change">
                                Ngày cũ: {{oldDate}} → Ngày mới: <strong>{{newDate}}</strong>
                            </div>
                        </div>
                        {{/each}}
                    </div>
                    {{/if}}
                </div>
                
                <p>Yêu cầu đổi vé của bạn đã được ghi nhận trong hệ thống và đang được xử lý. Vui lòng giữ lại mã yêu cầu đổi vé để tra cứu trạng thái sau này.</p>
                
                <div class="note-box">
                    <h3>Lưu ý quan trọng</h3>
                    <ul style="padding-left: 20px; margin-top: 10px; margin-bottom: 10px;">
                        <li>Yêu cầu đổi vé sẽ được xử lý trong vòng 24-48 giờ làm việc.</li>
                        <li>Vé mới sẽ được gửi qua email khi yêu cầu được chấp nhận.</li>
                        <li>Nếu có thay đổi về giá vé giữa ngày cũ và ngày mới, chúng tôi sẽ liên hệ với bạn.</li>
                        <li>Mỗi vé chỉ được đổi ngày một lần.</li>
                    </ul>
                </div>
                
                <div class="footer">
                    <p>Cần hỗ trợ? Liên hệ với chúng tôi:</p>
                    <p>Email: admin@hmgavietnam.com | Điện thoại: 0869.519.679</p>
                    <p>Đây là email tự động, vui lòng không trả lời trực tiếp.</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`,
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

      this.logger.log('Refund email templates seeded successfully');
    } catch (error) {
      this.logger.error(`Error seeding refund email templates: ${error.message}`);
      this.logger.error(error.stack);
      throw error;
    }
  }
} 