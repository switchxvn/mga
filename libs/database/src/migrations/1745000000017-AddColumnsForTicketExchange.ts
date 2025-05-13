import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnsForTicketExchange1745000000017 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Thêm cột new_order_id cho bảng order_refunds
    await queryRunner.query(`
      ALTER TABLE order_refunds 
      ADD COLUMN IF NOT EXISTS new_order_id INTEGER NULL REFERENCES orders(id) ON DELETE SET NULL
    `);

    // Thêm cột exchange_for_order_id cho bảng orders
    await queryRunner.query(`
      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS exchange_for_order_id INTEGER NULL REFERENCES orders(id) ON DELETE SET NULL
    `);

    // Tạo template email cho xác nhận đổi vé thành công
    await queryRunner.query(`
      INSERT INTO mail_templates (
        code, 
        title, 
        subject, 
        html, 
        from_email,
        from_name,
        is_active, 
        created_at,
        updated_at
      )
      VALUES (
        'TICKET_EXCHANGE_CONFIRMATION',
        'Xác nhận đổi vé thành công',
        'Xác nhận đổi vé thành công - Mã yêu cầu: {{refundCode}}',
        '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
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
        'noreply@example.com',
        'Dịch vụ khách hàng',
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (code) DO UPDATE
      SET 
        html = EXCLUDED.html,
        title = EXCLUDED.title,
        subject = EXCLUDED.subject,
        from_email = EXCLUDED.from_email,
        from_name = EXCLUDED.from_name,
        updated_at = NOW()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa cột new_order_id khỏi bảng order_refunds
    await queryRunner.query(`
      ALTER TABLE order_refunds DROP COLUMN IF EXISTS new_order_id
    `);

    // Xóa cột exchange_for_order_id khỏi bảng orders
    await queryRunner.query(`
      ALTER TABLE orders DROP COLUMN IF EXISTS exchange_for_order_id
    `);

    // Xóa template email đổi vé
    await queryRunner.query(`
      DELETE FROM mail_templates WHERE code = 'TICKET_EXCHANGE_CONFIRMATION'
    `);
  }
} 