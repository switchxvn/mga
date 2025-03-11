import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { PostTranslation } from '../entities/post-translation.entity';

@Injectable()
export class PostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostTranslation)
    private readonly postTranslationRepository: Repository<PostTranslation>
  ) {}

  async findAll() {
    return this.postRepository.find({
      relations: ['translations', 'author', 'author.profile'],
      where: { published: true },
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: number) {
    return this.postRepository.findOne({
      where: { id },
      relations: ['translations', 'author', 'author.profile']
    });
  }

  async findByLocale(locale: string) {
    this.logger.debug(`Finding posts for locale: ${locale}`);
    try {
      // First, try to get all posts with their translations
      const query = this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.translations', 'translations')
        .leftJoinAndSelect('post.author', 'author')
        .leftJoinAndSelect('author.profile', 'profile')
        .where('post.published = :published', { published: true })
        .orderBy('post.createdAt', 'DESC');

      // Log the generated SQL
      const [sql, parameters] = query.getQueryAndParameters();
      this.logger.debug('Generated SQL:', { sql, parameters });

      const posts = await query.getMany();
      this.logger.debug(`Found ${posts.length} posts before locale filtering`);

      // Filter translations in memory to handle the case where a post might not have translations
      const filteredPosts = posts.map(post => ({
        ...post,
        translations: post.translations?.filter(t => t.locale === locale) || []
      }));

      this.logger.debug(`Returning ${filteredPosts.length} posts after filtering`);
      return filteredPosts;
    } catch (error) {
      this.logger.error('Error in findByLocale:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async findBySlug(slug: string) {
    return this.postRepository.findOne({
      where: { slug, published: true },
      relations: ['translations', 'author', 'author.profile']
    });
  }

  async findBySlugWithAuthor(slug: string) {
    return this.postRepository.findOne({
      where: { slug, published: true },
      relations: ['translations', 'author', 'author.profile']
    });
  }

  async findBySlugWithAuthorAndTags(slug: string) {
    return this.postRepository.findOne({
      where: { slug, published: true },
      relations: ['translations', 'author', 'author.profile', 'postTags', 'postTags.tag']
    });
  }

  async findByIdWithAuthorAndTags(id: number) {
    return this.postRepository.findOne({
      where: { id, published: true },
      relations: ['translations', 'author', 'author.profile', 'postTags', 'postTags.tag']
    });
  }

  async findOneWithAuthor(id: number) {
    return this.postRepository.findOne({
      where: { id, published: true },
      relations: ['translations', 'author', 'author.profile']
    });
  }

  async findRelatedPosts(postId: number, limit: number = 3) {
    return this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.translations', 'translations')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.profile', 'profile')
      .where('post.id != :postId', { postId })
      .andWhere('post.published = :published', { published: true })
      .orderBy('RANDOM()')
      .take(limit)
      .getMany();
  }

  async findPopularPosts(limit: number = 5, excludeId?: number) {
    const query = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.translations', 'translations')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('author.profile', 'profile')
      .where('post.published = :published', { published: true });

    if (excludeId) {
      query.andWhere('post.id != :excludeId', { excludeId });
    }

    return query
      .orderBy('post.createdAt', 'DESC')
      .take(limit)
      .getMany();
  }

  async create(data: Partial<Post>, authorId: number) {
    const post = this.postRepository.create({
      ...data,
      authorId
    });
    return this.postRepository.save(post);
  }

  async update(id: number, data: Partial<Post>, authorId: number) {
    const post = await this.postRepository.findOne({
      where: { id, authorId },
      relations: ['translations']
    });

    if (!post) {
      throw new Error('Post not found or unauthorized');
    }

    Object.assign(post, data);
    return this.postRepository.save(post);
  }

  async remove(id: number, authorId: number) {
    const post = await this.postRepository.findOne({
      where: { id, authorId }
    });

    if (!post) {
      throw new Error('Post not found or unauthorized');
    }

    await this.postRepository.remove(post);
    return { success: true };
  }
} 