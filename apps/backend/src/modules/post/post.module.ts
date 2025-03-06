import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostAdminController } from './admin/controllers/admin.controller';
import { PostFrontendController } from './frontend/controllers/frontend.controller';
import { PostAdminService } from './admin/services/post-admin.service';
import { PostFrontendService } from './frontend/services/post-frontend.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [PostAdminController, PostFrontendController],
  providers: [PostAdminService, PostFrontendService],
  exports: [PostAdminService, PostFrontendService],
})
export class PostModule {} 