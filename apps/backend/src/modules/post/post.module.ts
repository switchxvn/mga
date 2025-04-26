import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../category/entities/category.entity';
import { UserProfile } from '../profile/entities/user-profile.entity';
import { Tag } from '../settings/entities/tag.entity';
import { User } from '../user/entities/user.entity';
import { PostAdminService } from './admin/services/post-admin.service';
import { PostTag } from './entities/post-tag.entity';
import { PostTranslation } from './entities/post-translation.entity';
import { Post } from './entities/post.entity';
import { PostFrontendService } from './frontend/services/post-frontend.service';
import { PostTransformer } from './transformers/post.transformer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, PostTranslation, PostTag, Tag, User, UserProfile, Category])
  ],
  controllers: [],
  providers: [
    PostAdminService,
    PostFrontendService,
    PostTransformer
  ],
  exports: [PostAdminService, PostFrontendService]
})
export class PostModule {} 