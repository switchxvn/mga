import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';
import { UserRepository } from './repositories/user.repository';
import { PostRepository } from './repositories/post.repository';
import { dataSourceOptions } from './config/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    TypeOrmModule.forFeature([User, Post]),
  ],
  providers: [
    UserRepository,
    PostRepository,
  ],
  exports: [
    TypeOrmModule,
    UserRepository,
    PostRepository,
  ],
})
export class DatabaseModule {} 