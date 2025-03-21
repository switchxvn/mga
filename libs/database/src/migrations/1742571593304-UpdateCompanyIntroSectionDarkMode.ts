import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCompanyIntroSectionDarkMode1742571593304 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const lightModeSettings = {
      stats: [
        { id: '1', label: 'Năm kinh nghiệm', value: '10+' },
        { id: '2', label: 'Khách hàng', value: '1000+' },
        { id: '3', label: 'Hỗ trợ kỹ thuật', value: '24/7' },
        { id: '4', label: 'Khách hàng hài lòng', value: '100%' }
      ],
      border: {
        color: '#ff9800',
        style: 'solid',
        width: '1px',
        radius: '0.5rem'
      },
      layout: 'full-text',
      maxWidth: '100%',
      textColor: 'var(--text)',
      buttonLink: '/about',
      buttonText: 'Tìm hiểu thêm',
      buttonStyle: {
        padding: '1rem 2rem',
        fontSize: '1.125rem',
        fontWeight: '600'
      },
      description: '<h2 style="color: #ff9800; text-align: center;">GIỚI THIỆU MGA VIỆT NAM</h2> <p> <strong style="color: #ff9800;">Mgavietnam</strong> – Đơn vị chuyên cung cấp các dòng <strong style="color: #ff9800;">xe nâng điện, xe nâng dầu, xe nâng tay điện, xe nâng tay thấp, xe nâng tay cao</strong> với chất lượng và dịch vụ tốt nhất. </p> <p> Với phương châm hoạt động <em>"Sự hài lòng của khách hàng là niềm vinh hạnh của chúng tôi"</em>. Mgavietnam cam kết mang đến cho khách hàng những dòng xe nâng hàng (<strong>Xe Forklift</strong>) với chất lượng tốt nhất, mức giá cạnh tranh nhất, và dịch vụ bán hàng tốt nhất trên thị trường. </p> <p> Dịch vụ sau bán hàng chu đáo – Mgavietnam cung cấp dịch vụ sau bán hàng tốt, với hệ thống xưởng dịch vụ xe nâng, kho phụ tùng xe nâng rộng khắp cả nước. Mgavietnam sẵn sàng hỗ trợ bạn <strong style="color: #ff9800;">24/7</strong> cho dù bạn ở đâu, bất cứ khi nào bạn cần. </p>',
      backgroundColor: '#ffffff'
    };

    const darkModeSettings = {
      ...lightModeSettings,
      border: {
        ...lightModeSettings.border,
        color: '#ff9800'
      },
      backgroundColor: 'var(--background)',
      textColor: 'var(--text)',
      description: lightModeSettings.description.replace(/#ff9800/g, '#ffa726')
    };

    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        settings,
        '{darkMode}',
        $1::jsonb
      )
      WHERE component_name = 'CompanyIntroSection'
    `, [JSON.stringify(darkModeSettings)]);

    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = jsonb_set(
        settings,
        '{lightMode}',
        $1::jsonb
      )
      WHERE component_name = 'CompanyIntroSection'
    `, [JSON.stringify(lightModeSettings)]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = settings - 'darkMode'
      WHERE component_name = 'CompanyIntroSection'
    `);

    await queryRunner.query(`
      UPDATE theme_sections
      SET settings = settings - 'lightMode'
      WHERE component_name = 'CompanyIntroSection'
    `);
  }
} 