import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment, CommentStatus } from '@ew/shared';
import { Repository } from 'typeorm';
import { Comment as CommentEntity } from '../../entities/comment.entity';
import { Post } from '../../../post/entities/post.entity';
import { User } from '../../../user/entities/user.entity';

@Injectable()
export class CommentFrontendService {
  private readonly logger = new Logger(CommentFrontendService.name);

  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByPostId(
    postId: number,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{ items: CommentEntity[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10 } = params || {};
    const skip = (page - 1) * limit;

    // Kiểm tra xem post có tồn tại không
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Lấy comments chỉ có status = approved và là top-level comments
    const queryBuilder = this.commentRepository.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('comment.replies', 'replies', 'replies.status = :replyStatus', { replyStatus: CommentStatus.APPROVED })
      .leftJoinAndSelect('replies.user', 'repliesUser')
      .leftJoinAndSelect('repliesUser.profile', 'repliesProfile')
      .where('comment.postId = :postId', { postId })
      .andWhere('comment.status = :status', { status: CommentStatus.APPROVED })
      .andWhere('comment.parentId IS NULL')
      .orderBy('comment.createdAt', 'DESC');

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  async create(data: {
    content: string;
    postId: number;
    userId?: string;
    parentId?: number;
    authorName?: string;
    authorEmail?: string;
  }): Promise<CommentEntity> {
    const { content, postId, userId, parentId, authorName, authorEmail } = data;

    // Kiểm tra xem post có tồn tại không
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Nếu là reply, kiểm tra xem comment cha có tồn tại không
    if (parentId) {
      const parentComment = await this.commentRepository.findOne({ where: { id: parentId } });
      if (!parentComment) {
        throw new NotFoundException(`Parent comment with ID ${parentId} not found`);
      }
    }

    // Nếu có userId, kiểm tra xem user có tồn tại không
    let user: User | null = null;
    if (userId) {
      user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
    }

    // Đối với anonymous comment, yêu cầu cung cấp authorName và authorEmail
    if (!userId && (!authorName || !authorEmail)) {
      throw new BadRequestException('Anonymous comments require author name and email');
    }

    // Tạo comment mới
    const comment = this.commentRepository.create({
      content,
      postId,
      userId,
      parentId,
      authorName: userId ? null : authorName,
      authorEmail: userId ? null : authorEmail,
      status: CommentStatus.PENDING, // Mặc định là pending, cần admin review
    });

    return this.commentRepository.save(comment);
  }
} 