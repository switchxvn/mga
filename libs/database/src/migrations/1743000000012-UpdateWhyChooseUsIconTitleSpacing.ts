import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateWhyChooseUsIconTitleSpacing1743000000012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const updatedSettings = {
      title: 'Tại sao chọn chúng tôi',
      description: '',
      layout: 'grid',
      columns: 5,
      items: [
        {
          icon: 'History',
          title: '30+ Năm Kinh Nghiệm',
          description: 'Với hơn 30 năm kinh nghiệm trong ngành, chúng tôi tự hào mang đến dịch vụ chuyên nghiệp và đáng tin cậy.'
        },
        {
          icon: 'Timer',
          title: 'Bàn Giao Xe Nhanh Nhất',
          description: 'Quy trình bàn giao xe nhanh chóng, thuận tiện với thủ tục đơn giản.'
        },
        {
          icon: 'Wrench',
          title: 'Bảo Hành Tận Nơi',
          description: 'Dịch vụ bảo hành tận nơi 24/7, đảm bảo xe của bạn luôn trong tình trạng hoạt động tốt nhất.'
        },
        {
          icon: 'PiggyBank',
          title: 'Giá Cả Cạnh Tranh',
          description: 'Cam kết mang đến mức giá tốt nhất thị trường cùng nhiều ưu đãi hấp dẫn.'    
        },
        {
          icon: 'Gauge',
          title: 'Động Cơ Nhật Bản',
          description: 'Sử dụng động cơ Nhật Bản chất lượng cao, đảm bảo độ bền và hiệu suất vượt trội.'
        }
      ],
      gap: '1rem',
      iconStyle: {
        height: '9rem',
        color: {
          light: '#00A0DC',
          dark: '#00A0DC'
        },
        margin: '0 auto 3rem auto', // Tăng margin bottom của icon lên 3rem
        hexagon: {
          size: '12rem',
          background: {
            light: '#FFFFFF',
            dark: '#1a1a1a'
          },
          border: {
            width: '0.3rem',
            gradient: {
              from: '#017399',
              to: '#00A0DC'
            }
          },
          padding: '0.15rem'
        }
      },
      titleStyle: {
        size: '2xl',
        weight: 'bold',
        fontWeight: '700',
        color: {
          light: '#00A0DC',
          dark: '#00A0DC'
        },
        margin: '0 0 1.5rem 0',
        textTransform: 'uppercase'
      },
      descriptionStyle: {
        size: 'lg',
        color: {
          light: '#333333',
          dark: '#FFFFFF'
        },
        margin: '0',
        maxWidth: '100%',
        padding: '0 0.5rem'
      }
    };

    await queryRunner.query(`
      UPDATE theme_sections 
      SET settings = '${JSON.stringify(updatedSettings)}'
      WHERE type = 'why_choose_us'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const previousSettings = {
      // Previous settings here
    };

    await queryRunner.query(`
      UPDATE theme_sections 
      SET settings = '${JSON.stringify(previousSettings)}'
      WHERE type = 'why_choose_us'
    `);
  }
} 