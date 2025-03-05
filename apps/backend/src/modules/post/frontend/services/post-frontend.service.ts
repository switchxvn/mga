import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../entities/post.entity';
import { CreatePostInput, UpdatePostInput } from '@ew/shared';

@Injectable()
export class PostFrontendService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostInput, authorId: number): Promise<Post> {
    const post = this.postRepository.create({
      ...createPostDto,
      authorId,
    });
    return this.postRepository.save(post);
  }

  async findPublished(): Promise<Post[]> {
    return this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.profile', 'profile', 'profile.user_id = author.id')
      .where('post.published = :published', { published: true })
      .getMany();
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.profile', 'profile', 'profile.user_id = author.id')
      .where('post.id = :id', { id })
      .andWhere('post.published = :published', { published: true })
      .getOne();

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostInput, userId: number): Promise<Post> {
    const post = await this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.profile', 'profile', 'profile.user_id = author.id')
      .where('post.id = :id', { id })
      .getOne();
    
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    
    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }
    
    Object.assign(post, updatePostDto);
    return this.postRepository.save(post);
  }

  async remove(id: number, userId: number): Promise<void> {
    const post = await this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.profile', 'profile', 'profile.user_id = author.id')
      .where('post.id = :id', { id })
      .getOne();
    
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    
    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }
    
    await this.postRepository.remove(post);
  }

  async findByAuthorId(authorId: number): Promise<Post[]> {
    return this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.profile', 'profile', 'profile.user_id = author.id')
      .where('post.authorId = :authorId', { authorId })
      .orderBy('post.createdAt', 'DESC')
      .getMany();
  }
} 