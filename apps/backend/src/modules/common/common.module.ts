import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryPhoneCode } from './entities/country-phone-code.entity';
import { CountryPhoneCodeService } from './country-phone-code.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CountryPhoneCode]),
  ],
  providers: [CountryPhoneCodeService],
  exports: [CountryPhoneCodeService],
})
export class CommonModule {} 