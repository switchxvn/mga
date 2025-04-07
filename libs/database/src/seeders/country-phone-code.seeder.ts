import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountryPhoneCode } from '../../../../apps/backend/src/modules/common/entities/country-phone-code.entity';

@Injectable()
export class CountryPhoneCodeSeeder {
  constructor(
    @InjectRepository(CountryPhoneCode)
    private countryPhoneCodeRepository: Repository<CountryPhoneCode>,
  ) {}

  async seed() {
    // Kiểm tra xem đã có dữ liệu chưa
    const count = await this.countryPhoneCodeRepository.count();
    if (count > 0) {
      console.log('Country phone codes already exist, skipping seed');
      return;
    }
    
    const countryPhoneCodes = [
      { phoneCode: '+84', countryCode: 'VN', countryName: 'Vietnam', flagEmoji: '🇻🇳' },
      { phoneCode: '+1', countryCode: 'US', countryName: 'United States', flagEmoji: '🇺🇸' },
      { phoneCode: '+81', countryCode: 'JP', countryName: 'Japan', flagEmoji: '🇯🇵' },
      { phoneCode: '+82', countryCode: 'KR', countryName: 'South Korea', flagEmoji: '🇰🇷' },
      { phoneCode: '+86', countryCode: 'CN', countryName: 'China', flagEmoji: '🇨🇳' },
      { phoneCode: '+65', countryCode: 'SG', countryName: 'Singapore', flagEmoji: '🇸🇬' },
      { phoneCode: '+66', countryCode: 'TH', countryName: 'Thailand', flagEmoji: '🇹🇭' },
      { phoneCode: '+60', countryCode: 'MY', countryName: 'Malaysia', flagEmoji: '🇲🇾' },
      { phoneCode: '+62', countryCode: 'ID', countryName: 'Indonesia', flagEmoji: '🇮🇩' },
      { phoneCode: '+63', countryCode: 'PH', countryName: 'Philippines', flagEmoji: '🇵🇭' },
      { phoneCode: '+44', countryCode: 'GB', countryName: 'United Kingdom', flagEmoji: '🇬🇧' },
      { phoneCode: '+33', countryCode: 'FR', countryName: 'France', flagEmoji: '🇫🇷' },
      { phoneCode: '+49', countryCode: 'DE', countryName: 'Germany', flagEmoji: '🇩🇪' },
      { phoneCode: '+39', countryCode: 'IT', countryName: 'Italy', flagEmoji: '🇮🇹' },
      { phoneCode: '+34', countryCode: 'ES', countryName: 'Spain', flagEmoji: '🇪🇸' },
      { phoneCode: '+7', countryCode: 'RU', countryName: 'Russia', flagEmoji: '🇷🇺' },
      { phoneCode: '+91', countryCode: 'IN', countryName: 'India', flagEmoji: '🇮🇳' },
      { phoneCode: '+61', countryCode: 'AU', countryName: 'Australia', flagEmoji: '🇦🇺' },
      { phoneCode: '+64', countryCode: 'NZ', countryName: 'New Zealand', flagEmoji: '🇳🇿' },
      { phoneCode: '+55', countryCode: 'BR', countryName: 'Brazil', flagEmoji: '🇧🇷' },
      { phoneCode: '+52', countryCode: 'MX', countryName: 'Mexico', flagEmoji: '🇲🇽' },
      { phoneCode: '+971', countryCode: 'AE', countryName: 'United Arab Emirates', flagEmoji: '🇦🇪' },
      { phoneCode: '+966', countryCode: 'SA', countryName: 'Saudi Arabia', flagEmoji: '🇸🇦' },
      { phoneCode: '+20', countryCode: 'EG', countryName: 'Egypt', flagEmoji: '🇪🇬' },
      { phoneCode: '+27', countryCode: 'ZA', countryName: 'South Africa', flagEmoji: '🇿🇦' },
      { phoneCode: '+234', countryCode: 'NG', countryName: 'Nigeria', flagEmoji: '🇳🇬' },
      { phoneCode: '+254', countryCode: 'KE', countryName: 'Kenya', flagEmoji: '🇰🇪' },
      { phoneCode: '+972', countryCode: 'IL', countryName: 'Israel', flagEmoji: '🇮🇱' },
      { phoneCode: '+90', countryCode: 'TR', countryName: 'Turkey', flagEmoji: '🇹🇷' },
      { phoneCode: '+380', countryCode: 'UA', countryName: 'Ukraine', flagEmoji: '🇺🇦' },
    ];

    const entities = this.countryPhoneCodeRepository.create(countryPhoneCodes);
    await this.countryPhoneCodeRepository.save(entities);
    console.log('Country phone codes seeded successfully');
  }
} 