import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from '../post/entities/post.entity';
import { User } from '../user/entities/user.entity';
import { Comment } from './entities/comment.entity';
import { CommentAdminService } from './admin/services/comment-admin.service';
import { CommentFrontendService } from './frontend/services/comment-frontend.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Post, User])
  ],
  controllers: [],
  providers: [
    CommentAdminService,
    CommentFrontendService
  ],
  exports: [CommentAdminService, CommentFrontendService]
})
export class CommentModule {} 