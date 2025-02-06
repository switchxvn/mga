import { Injectable } from '@nestjs/common';
import { CountryPhoneCode, CountryPhoneCodeRepository } from '@ew/database';

@Injectable()
export class CountryPhoneCodeService {
  constructor(
    private readonly countryPhoneCodeRepository: CountryPhoneCodeRepository,
  ) {}

  async findAll(): Promise<CountryPhoneCode[]> {
    return this.countryPhoneCodeRepository.find();
  }

  async findActive(): Promise<CountryPhoneCode[]> {
    return this.countryPhoneCodeRepository.findActive();
  }

  async findByPhoneCode(phoneCode: string): Promise<CountryPhoneCode | null> {
    return this.countryPhoneCodeRepository.findByPhoneCode(phoneCode);
  }

  async findByCountryCode(countryCode: string): Promise<CountryPhoneCode | null> {
    return this.countryPhoneCodeRepository.findByCountryCode(countryCode);
  }

  async searchByCountryName(query: string): Promise<CountryPhoneCode[]> {
    return this.countryPhoneCodeRepository.searchByCountryName(query);
  }

  async create(data: Partial<CountryPhoneCode>): Promise<CountryPhoneCode> {
    const countryPhoneCode = this.countryPhoneCodeRepository.create(data);
    return this.countryPhoneCodeRepository.save(countryPhoneCode);
  }

  async createMany(data: Partial<CountryPhoneCode>[]): Promise<CountryPhoneCode[]> {
    const countryPhoneCodes = this.countryPhoneCodeRepository.create(data);
    return this.countryPhoneCodeRepository.save(countryPhoneCodes);
  }

  async update(phoneCode: string, data: Partial<CountryPhoneCode>): Promise<CountryPhoneCode | null> {
    await this.countryPhoneCodeRepository.update({ phoneCode }, data);
    return this.countryPhoneCodeRepository.findByPhoneCode(phoneCode);
  }

  async delete(phoneCode: string): Promise<void> {
    await this.countryPhoneCodeRepository.delete({ phoneCode });
  }
} 