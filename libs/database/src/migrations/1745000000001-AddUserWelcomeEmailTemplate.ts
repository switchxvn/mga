import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserWelcomeEmailTemplate1745000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO mail_templates (
        code, 
        title, 
        subject, 
        html, 
        description, 
        from_email, 
        from_name, 
        variables, 
        is_active,
        created_at,
        updated_at
      ) 
      VALUES (
        'WELCOME_USER', 
        'Welcome new user', 
        'Chào mừng bạn đến với hệ thống', 
        '<!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to our system</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: #4a90e2;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 4px 4px 0 0;
            }
            .content {
              padding: 20px;
              border: 1px solid #ddd;
              border-top: none;
              border-radius: 0 0 4px 4px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #999;
            }
            .button {
              display: inline-block;
              background: #4a90e2;
              color: white;
              text-decoration: none;
              padding: 10px 20px;
              border-radius: 4px;
              margin: 20px 0;
            }
            .credentials {
              background: #f5f5f5;
              padding: 15px;
              border-radius: 4px;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Chào mừng bạn!</h1>
          </div>
          <div class="content">
            <p>Xin chào {{name}},</p>
            <p>Tài khoản của bạn đã được tạo thành công trên hệ thống quản trị của chúng tôi. Dưới đây là thông tin đăng nhập của bạn:</p>
            
            <div class="credentials">
              <p><strong>Email:</strong> {{email}}</p>
              <p><strong>Mật khẩu:</strong> {{password}}</p>
            </div>
            
            <p>Vui lòng đăng nhập và đổi mật khẩu của bạn ngay lập tức để đảm bảo tính bảo mật.</p>
            
            <a href="{{loginUrl}}" class="button">Đăng nhập ngay</a>
            
            <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với quản trị viên.</p>
            
            <p>Trân trọng,<br>Đội ngũ quản trị</p>
          </div>
          <div class="footer">
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </body>
        </html>', 
        'Template email chào mừng người dùng mới',
        'no-reply@example.com',
        'Admin System',
        '{"name": "User name", "email": "User email", "password": "User password", "loginUrl": "Login URL"}',
        true,
        NOW(),
        NOW()
      ) ON CONFLICT (code) DO UPDATE
      SET html = EXCLUDED.html,
          subject = EXCLUDED.subject,
          variables = EXCLUDED.variables,
          updated_at = NOW();

      INSERT INTO mail_templates (
        code, 
        title, 
        subject, 
        html, 
        description, 
        from_email, 
        from_name, 
        variables, 
        is_active,
        created_at,
        updated_at
      ) 
      VALUES (
        'RESET_PASSWORD', 
        'Reset Password', 
        'Đặt lại mật khẩu của bạn', 
        '<!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: #4a90e2;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 4px 4px 0 0;
            }
            .content {
              padding: 20px;
              border: 1px solid #ddd;
              border-top: none;
              border-radius: 0 0 4px 4px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #999;
            }
            .button {
              display: inline-block;
              background: #4a90e2;
              color: white;
              text-decoration: none;
              padding: 10px 20px;
              border-radius: 4px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Đặt lại mật khẩu</h1>
          </div>
          <div class="content">
            <p>Xin chào {{name}},</p>
            <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhấp vào nút bên dưới để tiếp tục:</p>
            
            <a href="{{resetLink}}" class="button">Đặt lại mật khẩu</a>
            
            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này hoặc liên hệ với quản trị viên.</p>
            
            <p>Liên kết này sẽ hết hạn sau 24 giờ.</p>
            
            <p>Trân trọng,<br>Đội ngũ quản trị</p>
          </div>
          <div class="footer">
            <p>Email này được gửi tự động, vui lòng không trả lời.</p>
          </div>
        </body>
        </html>', 
        'Template email để đặt lại mật khẩu',
        'no-reply@example.com',
        'Admin System',
        '{"name": "User name", "resetLink": "Password reset link"}',
        true,
        NOW(),
        NOW()
      ) ON CONFLICT (code) DO UPDATE
      SET html = EXCLUDED.html,
          subject = EXCLUDED.subject,
          variables = EXCLUDED.variables,
          updated_at = NOW();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM mail_templates WHERE code IN ('WELCOME_USER', 'RESET_PASSWORD');
    `);
  }
} 