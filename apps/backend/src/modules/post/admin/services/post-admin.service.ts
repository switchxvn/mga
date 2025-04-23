import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../entities/post.entity';
import { PostTranslation } from '../../entities/post-translation.entity';
import { CreatePostInput, UpdatePostInput } from '@ew/shared';

@Injectable()
export class PostAdminService {
  private readonly logger = new Logger(PostAdminService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostTranslation)
    private readonly postTranslationRepository: Repository<PostTranslation>
  ) {}

  async create(createPostDto: CreatePostInput, userId: string): Promise<Post> {
    const post = this.postRepository.create({
      ...createPostDto,
      authorId: userId
    });
    return this.postRepository.save(post);
  }

  async findAll() {
    return this.postRepository.find({
      relations: ['translations', 'author', 'author.profile'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number) {
    return this.postRepository.findOne({
      where: { id },
      relations: ['translations', 'author', 'author.profile']
    });
  }

  async update(id: number, updatePostDto: UpdatePostInput, userId: string): Promise<Post> {
    const post = await this.findOne(id);

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    Object.assign(post, updatePostDto);
    return this.postRepository.save(post);
  }

  async remove(id: number, userId: string): Promise<{ success: boolean }> {
    const post = await this.findOne(id);

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    await this.postRepository.remove(post);
    return { success: true };
  }

  async createTranslation(postId: number, data: Partial<PostTranslation>) {
    const translation = this.postTranslationRepository.create({
      ...data,
      postId
    });
    return this.postTranslationRepository.save(translation);
  }

  async updateTranslation(id: number, data: Partial<PostTranslation>) {
    await this.postTranslationRepository.update(id, data);
    return this.postTranslationRepository.findOne({
      where: { id },
      relations: ['post']
    });
  }

  async removeTranslation(id: number) {
    const translation = await this.postTranslationRepository.findOne({
      where: { id }
    });
    if (translation) {
      await this.postTranslationRepository.remove(translation);
    }
    return { success: true };
  }

  async getPosts({ page, limit, search, published }) {
    const query = this.postRepository.createQueryBuilder('post');

    if (search) {
      query.where('post.title ILIKE :search OR post.content ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (published !== null) {
      query.andWhere('post.published = :published', { published });
    }

    const [items, total] = await query
      .orderBy('post.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPost(id: number) {
    return this.postRepository.findOne({
      where: { id },
    });
  }

  async createPost(data: Partial<Post>) {
    const post = this.postRepository.create(data);
    return this.postRepository.save(post);
  }

  async updatePost(id: number, data: Partial<Post>) {
    await this.postRepository.update(id, data);
    return this.getPost(id);
  }

  async deletePost(id: number) {
    await this.postRepository.delete(id);
  }
} 