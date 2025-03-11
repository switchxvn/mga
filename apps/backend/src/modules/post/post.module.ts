import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { PostTranslation } from './entities/post-translation.entity';
import { PostTag } from './entities/post-tag.entity';
import { Tag } from '../settings/entities/tag.entity';
import { PostAdminController } from './admin/controllers/admin.controller';
import { PostFrontendController } from './frontend/controllers/frontend.controller';
import { PostAdminService } from './admin/services/post-admin.service';
import { PostFrontendService } from './frontend/services/post-frontend.service';
import { User } from '../user/entities/user.entity';
import { UserProfile } from '../profile/entities/user-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostTranslation, PostTag, Tag, User, UserProfile])],
  controllers: [PostAdminController, PostFrontendController],
  providers: [PostAdminService, PostFrontendService],
  exports: [PostAdminService, PostFrontendService],
})
export class PostModule {} 