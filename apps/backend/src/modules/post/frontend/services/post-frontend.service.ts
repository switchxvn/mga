import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Not, In } from 'typeorm';
import { Post } from '../../entities/post.entity';
import { PostTranslation } from '../../entities/post-translation.entity';
import { CreatePostInput, UpdatePostInput } from '@ew/shared';
import { Post as IPost } from '@ew/shared';
import { PostTag } from '../../entities/post-tag.entity';
import { Tag } from '../../../settings/entities/tag.entity';

@Injectable()
export class PostFrontendService {
  private readonly logger: Logger;

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostTag)
    private readonly postTagRepository: Repository<PostTag>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(PostTranslation)
    private readonly postTranslationRepository: Repository<PostTranslation>,
  ) {
    this.logger = new Logger(PostFrontendService.name);
  }

  async create(createPostDto: CreatePostInput, authorId: number): Promise<Post> {
    const post = this.postRepository.create({
      ...createPostDto,
      authorId,
    });
    return this.postRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return this.postRepository.find();
  }

  private async formatPostResponse(post: Post, locale?: string): Promise<IPost> {
    // Get current translation if locale is provided
    let currentTranslation = null;
    if (locale) {
      currentTranslation = post.translations?.find(t => t.locale === locale);
      if (!currentTranslation) {
        throw new NotFoundException(`Translation not found for locale "${locale}"`);
      }
    }

    // Format tags if available
    const tags = post.postTags
      ? post.postTags
          .map(pt => pt.tag)
          .filter(tag => tag.isActive)
          .map(tag => ({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            color: tag.color,
            description: tag.description,
            isActive: tag.isActive
          }))
      : [];

    // Format author profile if available
    const authorProfile = post.author?.profile instanceof Promise 
      ? await post.author.profile 
      : post.author?.profile;

    const profile = authorProfile ? {
      id: authorProfile.id,
      firstName: authorProfile.firstName,
      lastName: authorProfile.lastName,
      phoneNumber: authorProfile.phoneNumber,
      phoneCode: authorProfile.phoneCode,
      address: authorProfile.address || {
        street: null,
        city: null,
        state: null,
        country: null,
        zipCode: null
      },
      createdAt: authorProfile.createdAt.toISOString(),
      updatedAt: authorProfile.updatedAt.toISOString()
    } : {
      id: null,
      firstName: null,
      lastName: null,
      phoneNumber: null,
      phoneCode: null,
      address: {
        street: null,
        city: null,
        state: null,
        country: null,
        zipCode: null
      },
      createdAt: null,
      updatedAt: null
    };

    return {
      id: post.id,
      title: currentTranslation?.title || '',
      content: currentTranslation?.content || '',
      shortDescription: currentTranslation?.shortDescription || '',
      thumbnail: post.thumbnail,
      published: post.published,
      authorId: post.authorId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      tags,
      author: post.author ? {
        id: post.author.id,
        email: post.author.email,
        username: post.author.username,
        isEmailVerified: post.author.isEmailVerified,
        isActive: post.author.isActive,
        lastLoginAt: post.author.lastLoginAt,
        createdAt: post.author.createdAt,
        updatedAt: post.author.updatedAt,
        profile
      } : null,
      translations: post.translations?.map(t => ({
        id: t.id,
        locale: t.locale,
        title: t.title,
        content: t.content,
        shortDescription: t.shortDescription,
        slug: t.slug,
        metaTitle: t.metaTitle,
        metaDescription: t.metaDescription,
        metaKeywords: t.metaKeywords,
        ogTitle: t.ogTitle,
        ogDescription: t.ogDescription,
        ogImage: t.ogImage,
        canonicalUrl: t.canonicalUrl,
        postId: t.postId,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      })) || []
    };
  }

  async findByLocale(locale: string): Promise<IPost[]> {
    this.logger.debug(`Finding posts for locale: ${locale}`);

    try {
      const posts = await this.postRepository.find({
        where: { published: true },
        relations: ['translations', 'author', 'author.profile', 'postTags', 'postTags.tag'],
        order: { createdAt: 'DESC' }
      });

      this.logger.debug(`Found ${posts.length} published posts before filtering by locale`);

      // Filter posts that have translations in the requested locale
      const postsWithTranslations = posts.filter(post => {
        return post.translations?.some(translation => translation.locale === locale);
      });

      this.logger.debug(`Found ${postsWithTranslations.length} posts with translations in locale ${locale}`);

      // Format each post
      const formattedPosts = await Promise.all(
        postsWithTranslations.map(post => this.formatPostResponse(post, locale))
      );

      return formattedPosts;
    } catch (error) {
      this.logger.error(`Error finding posts by locale ${locale}:`, error);
      throw error;
    }
  }

  async findPublished(): Promise<Post[]> {
    return this.postRepository.find({
      where: { published: true }
    });
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id, published: true }
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async findOneWithAuthor(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id, published: true },
      relations: ['author', 'author.profile']
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Đảm bảo author đã được load
    if (post.author) {
      await post.author;
    }

    return post;
  }

  async findRelatedPosts(id: number, locale: string, limit = 3): Promise<IPost[]> {
    try {
      // Get current post
      const currentPost = await this.postRepository.findOne({
        where: { id, published: true },
        relations: ['translations']
      });

      if (!currentPost) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }

      // Get related posts by author
      const relatedPosts = await this.postRepository.find({
        where: { 
          authorId: currentPost.authorId,
          published: true,
          id: Not(id)
        },
        relations: ['translations', 'author', 'author.profile', 'postTags', 'postTags.tag'],
        order: { createdAt: 'DESC' },
        take: limit
      });

      // If not enough posts, get recent posts
      if (relatedPosts.length < limit) {
        const recentPosts = await this.postRepository.find({
          where: { 
            published: true,
            id: Not(In([id, ...relatedPosts.map(p => p.id)]))
          },
          relations: ['translations', 'author', 'author.profile', 'postTags', 'postTags.tag'],
          order: { createdAt: 'DESC' },
          take: limit - relatedPosts.length
        });

        relatedPosts.push(...recentPosts);
      }

      // Format all posts
      return Promise.all(relatedPosts.map(post => this.formatPostResponse(post, locale)));
    } catch (error) {
      this.logger.error('Error in findRelatedPosts:', error);
      throw error;
    }
  }

  async findPopularPosts(locale: string, limit: number = 5, excludeId?: number): Promise<IPost[]> {
    try {
      const whereCondition: any = { published: true };
      if (excludeId) {
        whereCondition.id = Not(excludeId);
      }

      const posts = await this.postRepository.find({
        where: whereCondition,
        relations: ['translations', 'author', 'author.profile', 'postTags', 'postTags.tag'],
        order: { createdAt: 'DESC' },
        take: limit
      });

      return Promise.all(posts.map(post => this.formatPostResponse(post, locale)));
    } catch (error) {
      this.logger.error('Error in findPopularPosts:', error);
      throw error;
    }
  }

  async update(id: number, updatePostDto: UpdatePostInput, userId: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id }
    });

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
    const post = await this.postRepository.findOne({
      where: { id }
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postRepository.remove(post);
  }

  async findByAuthorId(authorId: number): Promise<Post[]> {
    return this.postRepository.find({
      where: { authorId },
      order: { createdAt: 'DESC' }
    });
  }

  async findBySlug(slug: string, locale = 'vi'): Promise<Post> {
    // Find translation first
    const translation = await this.postTranslationRepository.findOne({
      where: { slug, locale },
      relations: ['post']
    });

    if (!translation || !translation.post) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }

    const post = await this.postRepository.findOne({
      where: { 
        id: translation.post.id,
        published: true 
      }
    });

    if (!post) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }

    return post;
  }

  async findBySlugWithAuthor(slug: string, locale = 'vi'): Promise<Post> {
    // Find translation first
    const translation = await this.postTranslationRepository.findOne({
      where: { slug, locale },
      relations: ['post']
    });

    if (!translation || !translation.post) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }

    const post = await this.postRepository.findOne({
      where: { 
        id: translation.post.id,
        published: true 
      },
      relations: ['author', 'author.profile']
    });

    if (!post) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }

    // Đảm bảo author đã được load
    if (post.author) {
      await post.author;
    }

    return post;
  }

  async findBySlugWithAuthorAndTags(slug: string): Promise<IPost> {
    try {
      // First, find the translation to get the postId
      const translation = await this.postTranslationRepository.findOne({
        where: { slug },
        relations: ['post']
      });

      if (!translation || !translation.post) {
        throw new NotFoundException(`Post with slug "${slug}" not found`);
      }

      // Then use the postId to get all data including all translations
      const qb = this.postRepository.createQueryBuilder('post')
        .innerJoinAndSelect('post.translations', 'translations')
        .leftJoinAndSelect('post.author', 'author')
        .leftJoinAndSelect('author.profile', 'profile')
        .leftJoinAndSelect('post.postTags', 'postTags')
        .leftJoinAndSelect('postTags.tag', 'tag')
        .where('post.id = :postId', { postId: translation.post.id })
        .andWhere('post.published = :published', { published: true });

      const post = await qb.getOne();

      if (!post) {
        throw new NotFoundException(`Post with id "${translation.post.id}" not found`);
      }

      // Format response without locale filtering
      return this.formatPostResponse(post);
    } catch (error) {
      this.logger.error('Error in findBySlugWithAuthorAndTags:', error);
      throw new NotFoundException(`Failed to retrieve post with slug "${slug}"`);
    }
  }

  async findByIdWithAuthorAndTags(id: number, locale?: string): Promise<IPost> {
    try {
      const post = await this.postRepository.findOne({
        where: { id, published: true },
        relations: ['translations', 'author', 'author.profile', 'postTags', 'postTags.tag']
      });

      if (!post) {
        throw new NotFoundException(`Post with id "${id}" not found`);
      }

      return this.formatPostResponse(post, locale);
    } catch (error) {
      this.logger.error('Error in findByIdWithAuthorAndTags:', error);
      throw new NotFoundException(`Failed to retrieve post with id "${id}"`);
    }
  }

  async findByLocaleAndCategories(locale: string, categoryIds: number[]): Promise<IPost[]> {
    this.logger.debug(`Finding posts for locale: ${locale} and categories: ${categoryIds.join(',')}`);

    try {
      const posts = await this.postRepository.createQueryBuilder('post')
        .innerJoin('post.categories', 'category', 'category.id IN (:...categoryIds)', { categoryIds })
        .innerJoinAndSelect('post.translations', 'translations')
        .leftJoinAndSelect('post.author', 'author')
        .leftJoinAndSelect('author.profile', 'profile')
        .leftJoinAndSelect('post.postTags', 'postTags')
        .leftJoinAndSelect('postTags.tag', 'tag')
        .where('post.published = :published', { published: true })
        .orderBy('post.createdAt', 'DESC')
        .getMany();

      this.logger.debug(`Found ${posts.length} published posts with categories ${categoryIds.join(',')}`);

      // Filter posts that have translations in the requested locale
      const postsWithTranslations = posts.filter(post => {
        return post.translations?.some(translation => translation.locale === locale);
      });

      this.logger.debug(`Found ${postsWithTranslations.length} posts with translations in locale ${locale}`);

      // Format each post
      const formattedPosts = await Promise.all(
        postsWithTranslations.map(post => this.formatPostResponse(post, locale))
      );

      return formattedPosts;
    } catch (error) {
      this.logger.error(`Error finding posts by locale ${locale} and categories ${categoryIds.join(',')}:`, error);
      throw error;
    }
  }

  async findByCategories(categoryIds: number[]): Promise<IPost[]> {
    this.logger.debug(`Finding posts for categories: ${categoryIds.join(',')}`);

    try {
      const posts = await this.postRepository.createQueryBuilder('post')
        .innerJoin('post.categories', 'category', 'category.id IN (:...categoryIds)', { categoryIds })
        .innerJoinAndSelect('post.translations', 'translations')
        .leftJoinAndSelect('post.author', 'author')
        .leftJoinAndSelect('author.profile', 'profile')
        .leftJoinAndSelect('post.postTags', 'postTags')
        .leftJoinAndSelect('postTags.tag', 'tag')
        .where('post.published = :published', { published: true })
        .orderBy('post.createdAt', 'DESC')
        .getMany();

      this.logger.debug(`Found ${posts.length} published posts with categories ${categoryIds.join(',')}`);

      // Format each post
      const formattedPosts = await Promise.all(
        posts.map(post => this.formatPostResponse(post))
      );

      return formattedPosts;
    } catch (error) {
      this.logger.error(`Error finding posts by categories ${categoryIds.join(',')}:`, error);
      throw error;
    }
  }
} 