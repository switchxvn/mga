import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CountryPhoneCode } from '../entities/country-phone-code.entity';

@Injectable()
export class CountryPhoneCodeRepository extends Repository<CountryPhoneCode> {
  constructor(private dataSource: DataSource) {
    super(CountryPhoneCode, dataSource.createEntityManager());
  }

  async findByPhoneCode(phoneCode: string): Promise<CountryPhoneCode | null> {
    return this.findOne({ where: { phoneCode } });
  }

  async findActive(): Promise<CountryPhoneCode[]> {
    return this.find({
      where: { isActive: true },
      order: {
        countryName: 'ASC',
      },
    });
  }

  async findByCountryCode(countryCode: string): Promise<CountryPhoneCode | null> {
    return this.findOne({ where: { countryCode } });
  }

  async searchByCountryName(query: string): Promise<CountryPhoneCode[]> {
    return this.createQueryBuilder('country_phone_code')
      .where('LOWER(country_phone_code.country_name) LIKE LOWER(:query)', { query: `%${query}%` })
      .orderBy('country_phone_code.country_name', 'ASC')
      .getMany();
  }
} 