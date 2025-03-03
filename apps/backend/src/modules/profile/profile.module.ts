import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile, CountryPhoneCode } from '@ew/database';
import { ProfileService } from './services/profile.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserProfile, CountryPhoneCode]),
  ],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {} 