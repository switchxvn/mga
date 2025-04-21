import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { publicProcedure, router } from '../procedures';
import { CountryPhoneCodeService } from '../../common/country-phone-code.service';

@Injectable()
export class CommonRouter {
  constructor(private readonly countryPhoneCodeService: CountryPhoneCodeService) {}

  public readonly router = router({
    getCountryPhoneCodes: publicProcedure
      .query(async () => {
        const countryCodes = await this.countryPhoneCodeService.findActive();
        return countryCodes.sort((a, b) => {
          // Đặt Việt Nam lên đầu tiên
          if (a.countryCode === 'VN') return -1;
          if (b.countryCode === 'VN') return 1;
          // Sau đó sắp xếp theo tên quốc gia
          return a.countryName.localeCompare(b.countryName);
        });
      }),

    getCountryPhoneCodesByName: publicProcedure
      .input(
        z.object({
          query: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        const { query } = input;
        if (!query) {
          return this.countryPhoneCodeService.findActive();
        }
        return this.countryPhoneCodeService.searchByCountryName(query);
      }),

    getCountryPhoneCodeByCode: publicProcedure
      .input(
        z.object({
          phoneCode: z.string(),
        })
      )
      .query(async ({ input }) => {
        const { phoneCode } = input;
        return this.countryPhoneCodeService.findByPhoneCode(phoneCode);
      }),
  });
} 