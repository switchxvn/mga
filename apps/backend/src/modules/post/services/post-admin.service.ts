import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { CreateAdminPostInput } from '@ew/shared';

@Injectable()
export class PostAdminService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>
  ) {}

  async getPost(id: number): Promise<Post> {
    return this.postRepository.findOne({
      where: { id },
      relations: {
        translations: true,
        categories: {
          translations: true
        },
        postTags: {
          tag: true
        },
        author: {
          profile: true
        }
      }
    });
  }

  async getPosts(params: {
    page: number;
    limit: number;
    search?: string;
    published?: boolean | null;
  }): Promise<{ items: Post[]; total: number }> {
    const { page, limit, search, published } = params;
    const query = this.postRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.translations', 'translations')
      .leftJoinAndSelect('post.categories', 'categories')
      .leftJoinAndSelect('categories.translations', 'categoryTranslations')
      .leftJoinAndSelect('post.postTags', 'postTags')
      .leftJoinAndSelect('postTags.tag', 'tag')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.profile', 'profile');

    if (search) {
      query.where('post.title ILIKE :search', { search: `%${search}%` });
    }

    if (published !== null) {
      query.andWhere('post.published = :published', { published });
    }

    const [posts, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: posts,
      total
    };
  }

  async createPostWithTranslations(input: CreateAdminPostInput): Promise<Post> {
    const post = this.postRepository.create(input);
    const savedPost = await this.postRepository.save(post);
    return this.getPost(savedPost.id);
  }

  async updatePost(id: number, input: CreateAdminPostInput): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new Error(`Post with ID ${id} not found`);
    }

    // Update only the fields that are present in the input
    Object.assign(post, input);
    
    const savedPost = await this.postRepository.save(post);
    return this.getPost(savedPost.id);
  }

  async updatePostStatus(id: number, status: string): Promise<Post> {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      throw new Error(`Post with ID ${id} not found`);
    }

    post.published = status === 'PUBLISHED';
    const savedPost = await this.postRepository.save(post);
    return this.getPost(savedPost.id);
  }

  async deletePost(id: number): Promise<void> {
    await this.postRepository.delete(id);
  }
} 