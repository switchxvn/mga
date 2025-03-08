import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCountryPhoneCodes1741404579833 implements MigrationInterface {
  name = 'SeedCountryPhoneCodes1741404579833';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Kiểm tra xem cột flag_icon đã tồn tại chưa
    const tableColumns = await queryRunner.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'country_phone_codes' AND column_name = 'flag_icon'`
    );
    
    // Nếu cột chưa tồn tại, thêm vào
    if (tableColumns.length === 0) {
      await queryRunner.query(`ALTER TABLE "country_phone_codes" ADD "flag_icon" character varying`);
    }

    // Thêm dữ liệu cho bảng country_phone_codes
    await queryRunner.query(`
      INSERT INTO country_phone_codes (phone_code, country_code, country_name, flag_icon, is_active)
      VALUES
      ('+84', 'VN', 'Vietnam', 'https://flagcdn.com/w20/vn.png', true),
      ('+1', 'US', 'United States', 'https://flagcdn.com/w20/us.png', true),
      ('+44', 'GB', 'United Kingdom', 'https://flagcdn.com/w20/gb.png', true),
      ('+61', 'AU', 'Australia', 'https://flagcdn.com/w20/au.png', true),
      ('+81', 'JP', 'Japan', 'https://flagcdn.com/w20/jp.png', true),
      ('+82', 'KR', 'South Korea', 'https://flagcdn.com/w20/kr.png', true),
      ('+86', 'CN', 'China', 'https://flagcdn.com/w20/cn.png', true),
      ('+65', 'SG', 'Singapore', 'https://flagcdn.com/w20/sg.png', true),
      ('+60', 'MY', 'Malaysia', 'https://flagcdn.com/w20/my.png', true),
      ('+66', 'TH', 'Thailand', 'https://flagcdn.com/w20/th.png', true),
      ('+62', 'ID', 'Indonesia', 'https://flagcdn.com/w20/id.png', true),
      ('+63', 'PH', 'Philippines', 'https://flagcdn.com/w20/ph.png', true),
      ('+91', 'IN', 'India', 'https://flagcdn.com/w20/in.png', true),
      ('+33', 'FR', 'France', 'https://flagcdn.com/w20/fr.png', true),
      ('+49', 'DE', 'Germany', 'https://flagcdn.com/w20/de.png', true),
      ('+39', 'IT', 'Italy', 'https://flagcdn.com/w20/it.png', true),
      ('+34', 'ES', 'Spain', 'https://flagcdn.com/w20/es.png', true),
      ('+31', 'NL', 'Netherlands', 'https://flagcdn.com/w20/nl.png', true),
      ('+7', 'RU', 'Russia', 'https://flagcdn.com/w20/ru.png', true),
      ('+55', 'BR', 'Brazil', 'https://flagcdn.com/w20/br.png', true),
      ('+52', 'MX', 'Mexico', 'https://flagcdn.com/w20/mx.png', true),
      ('+971', 'AE', 'United Arab Emirates', 'https://flagcdn.com/w20/ae.png', true),
      ('+966', 'SA', 'Saudi Arabia', 'https://flagcdn.com/w20/sa.png', true),
      ('+27', 'ZA', 'South Africa', 'https://flagcdn.com/w20/za.png', true),
      ('+20', 'EG', 'Egypt', 'https://flagcdn.com/w20/eg.png', true)
      ON CONFLICT (phone_code) DO UPDATE SET
        country_code = EXCLUDED.country_code,
        country_name = EXCLUDED.country_name,
        flag_icon = EXCLUDED.flag_icon,
        is_active = EXCLUDED.is_active
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa dữ liệu đã thêm
    await queryRunner.query(`DELETE FROM country_phone_codes`);
  }
} 