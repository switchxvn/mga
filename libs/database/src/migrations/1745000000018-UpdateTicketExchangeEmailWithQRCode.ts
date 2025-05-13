import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateTicketExchangeEmailWithQRCode1745000000018 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Cập nhật template email xác nhận đổi vé thành công với QR code
    await queryRunner.query(`
      UPDATE mail_templates
      SET 
        html = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #4CAF50; text-align: center;">Xác Nhận Đổi Vé Thành Công</h2>
          
          <p>Kính gửi <strong>{{customerName}}</strong>,</p>
          
          <p>Chúng tôi xin thông báo yêu cầu đổi vé của bạn đã được xử lý thành công.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <p><strong>Mã yêu cầu đổi vé:</strong> {{refundCode}}</p>
            <p><strong>Mã đơn hàng gốc:</strong> {{originalOrderCode}}</p>
            <p><strong>Mã đơn hàng mới:</strong> {{newOrderCode}}</p>
          </div>
          
          <h3 style="margin-top: 20px;">Chi tiết vé đã đổi:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Tên vé</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Số lượng</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Ngày cũ</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Ngày mới</th>
              </tr>
            </thead>
            <tbody>
              {{#each tickets}}
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">{{this.productName}} {{#if this.variantName}}<br><span style="font-size: 12px; color: #666;">{{this.variantName}}</span>{{/if}}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">{{this.quantity}}</td>
                <td style="border: 1px solid #ddd; padding: 8px; color: #f44336; text-decoration: line-through;">{{this.oldDate}}</td>
                <td style="border: 1px solid #ddd; padding: 8px; color: #4CAF50; font-weight: bold;">{{this.newDate}}</td>
              </tr>
              {{/each}}
            </tbody>
          </table>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #f0f7ff; border: 1px solid #cce5ff; border-radius: 5px; text-align: center;">
            <h4 style="color: #0056b3; margin-top: 0;">Mã QR Vé Mới</h4>
            <p>Quét mã QR dưới đây để sử dụng vé của bạn:</p>
            
            {{#each tickets}}
              {{#if this.qrImageUrl}}
                <div style="margin: 15px 0; padding: 10px; background-color: white; border-radius: 5px;">
                  <p style="font-weight: bold; margin-bottom: 5px;">{{this.productName}} {{#if this.variantName}}<span style="font-size: 12px; color: #666;">- {{this.variantName}}</span>{{/if}}</p>
                  <img src="{{this.qrImageUrl}}" alt="Mã QR vé" style="max-width: 200px; height: auto; margin: 0 auto; display: block;" />
                  <p style="font-size: 12px; color: #666; margin-top: 5px;">Ngày đi: {{this.newDate}}</p>
                </div>
              {{/if}}
            {{/each}}
          </div>
          
          <p style="margin-top: 20px;">Vé mới đã được cập nhật ngày và sẵn sàng sử dụng. Bạn có thể kiểm tra thông tin chi tiết trong tài khoản của mình hoặc sử dụng mã đơn hàng mới để tra cứu.</p>
          
          <p>Xin cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #777; font-size: 12px;">
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc hotline.</p>
          </div>
        </div>',
        subject = 'Xác nhận đổi vé thành công - Mã yêu cầu: {{refundCode}}',
        updated_at = NOW()
      WHERE code = 'TICKET_EXCHANGE_CONFIRMATION'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Khôi phục template email ban đầu khi rollback
    await queryRunner.query(`
      UPDATE mail_templates
      SET 
        html = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #4CAF50; text-align: center;">Xác Nhận Đổi Vé Thành Công</h2>
          
          <p>Kính gửi <strong>{{customerName}}</strong>,</p>
          
          <p>Chúng tôi xin thông báo yêu cầu đổi vé của bạn đã được xử lý thành công.</p>
          
          <div style="background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px;">
            <p><strong>Mã yêu cầu đổi vé:</strong> {{refundCode}}</p>
            <p><strong>Mã đơn hàng gốc:</strong> {{originalOrderCode}}</p>
            <p><strong>Mã đơn hàng mới:</strong> {{newOrderCode}}</p>
          </div>
          
          <h3 style="margin-top: 20px;">Chi tiết vé đã đổi:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Tên vé</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Số lượng</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Ngày cũ</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Ngày mới</th>
              </tr>
            </thead>
            <tbody>
              {{#each tickets}}
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">{{this.productName}} {{#if this.variantName}}<br><span style="font-size: 12px; color: #666;">{{this.variantName}}</span>{{/if}}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">{{this.quantity}}</td>
                <td style="border: 1px solid #ddd; padding: 8px; color: #f44336; text-decoration: line-through;">{{this.oldDate}}</td>
                <td style="border: 1px solid #ddd; padding: 8px; color: #4CAF50; font-weight: bold;">{{this.newDate}}</td>
              </tr>
              {{/each}}
            </tbody>
          </table>
          
          <p style="margin-top: 20px;">Vé mới đã được cập nhật ngày và sẵn sàng sử dụng. Bạn có thể kiểm tra thông tin chi tiết trong tài khoản của mình hoặc sử dụng mã đơn hàng mới để tra cứu.</p>
          
          <p>Xin cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #777; font-size: 12px;">
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email hoặc hotline.</p>
          </div>
        </div>',
        updated_at = NOW()
      WHERE code = 'TICKET_EXCHANGE_CONFIRMATION'
    `);
  }
} 