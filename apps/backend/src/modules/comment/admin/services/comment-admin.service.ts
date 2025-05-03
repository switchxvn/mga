import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment, CommentStatus } from '@ew/shared';
import { Repository } from 'typeorm';
import { Comment as CommentEntity } from '../../entities/comment.entity';
import { Post } from '../../../post/entities/post.entity';

@Injectable()
export class CommentAdminService {
  private readonly logger = new Logger(CommentAdminService.name);

  constructor(
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async findAll(params?: {
    postId?: number;
    status?: CommentStatus;
    page?: number;
    limit?: number;
  }): Promise<{ items: CommentEntity[]; total: number; page: number; limit: number }> {
    const { postId, status, page = 1, limit = 10 } = params || {};
    const skip = (page - 1) * limit;

    const queryBuilder = this.commentRepository.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('comment.post', 'post')
      .leftJoinAndSelect('comment.replies', 'replies')
      .leftJoinAndSelect('replies.user', 'repliesUser')
      .leftJoinAndSelect('repliesUser.profile', 'repliesProfile');

    if (postId) {
      queryBuilder.andWhere('comment.postId = :postId', { postId });
    }

    if (status) {
      queryBuilder.andWhere('comment.status = :status', { status });
    }

    // Only get top-level comments
    queryBuilder.andWhere('comment.parentId IS NULL');

    // Order by creation date (newest first)
    queryBuilder.orderBy('comment.createdAt', 'DESC');

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  async findOne(id: number): Promise<CommentEntity> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'user.profile', 'post', 'replies', 'replies.user', 'replies.user.profile'],
    });

    if (!comment) {
      this.logger.warn(`Comment with ID ${id} not found`);
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async updateStatus(id: number, status: CommentStatus): Promise<CommentEntity> {
    const comment = await this.findOne(id);
    comment.status = status;
    return this.commentRepository.save(comment);
  }

  async remove(id: number): Promise<void> {
    const comment = await this.findOne(id);
    await this.commentRepository.remove(comment);
  }

  async getCommentCounts(): Promise<{ pending: number; approved: number; rejected: number; spam: number; total: number }> {
    const queryBuilder = this.commentRepository.createQueryBuilder('comment');
    
    const counts = await queryBuilder
      .select('comment.status', 'status')
      .addSelect('COUNT(comment.id)', 'count')
      .groupBy('comment.status')
      .getRawMany();

    const result = {
      pending: 0,
      approved: 0,
      rejected: 0,
      spam: 0,
      total: 0
    };

    counts.forEach(row => {
      if (row.status === CommentStatus.PENDING) {
        result.pending = parseInt(row.count, 10);
      } else if (row.status === CommentStatus.APPROVED) {
        result.approved = parseInt(row.count, 10);
      } else if (row.status === CommentStatus.REJECTED) {
        result.rejected = parseInt(row.count, 10);
      } else if (row.status === CommentStatus.SPAM) {
        result.spam = parseInt(row.count, 10);
      }
    });

    result.total = result.pending + result.approved + result.rejected + result.spam;
    return result;
  }
} 