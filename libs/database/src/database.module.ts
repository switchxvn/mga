import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Post } from './entities/post.entity';
import { CountryPhoneCode } from './entities/country-phone-code.entity';
import { UserRepository } from './repositories/user.repository';
import { PostRepository } from './repositories/post.repository';
import { CountryPhoneCodeRepository } from './repositories/country-phone-code.repository';
import { dataSourceOptions } from './config/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature([User, UserProfile, Post, CountryPhoneCode]),
  ],
  providers: [
    UserRepository,
    PostRepository,
    CountryPhoneCodeRepository,
  ],
  exports: [
    TypeOrmModule,
    UserRepository,
    PostRepository,
    CountryPhoneCodeRepository,
  ],
})
export class DatabaseModule {} 