import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service, CountryPhoneCode]),
  ],
  exports: [
    TypeOrmModule.forFeature([Service, CountryPhoneCode]),
  ],
})
export class DatabaseModule {} 