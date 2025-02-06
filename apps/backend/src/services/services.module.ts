import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryPhoneCode, Post, User, UserProfile } from '@ew/database';
import { CountryPhoneCodeService } from './country-phone-code.service';
import { PostService } from './post.service';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, Post, CountryPhoneCode]),
  ],
  providers: [
    CountryPhoneCodeService,
    PostService,
    UserService,
  ],
  exports: [
    CountryPhoneCodeService,
    PostService,
    UserService,
  ],
})
export class ServicesModule {} 