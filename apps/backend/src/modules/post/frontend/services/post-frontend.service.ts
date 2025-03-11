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

  async findByLocale(locale: string): Promise<Post[]> {
    this.logger.debug(`Finding posts for locale: ${locale}`);

    try {
      const posts = await this.postRepository.find({
        where: { published: true },
        relations: ['translations', 'author', 'author.profile'],
        order: { createdAt: 'DESC' }
      });

      this.logger.debug(`Found ${posts.length} published posts before filtering by locale`);

      // Filter posts that have translations in the requested locale
      const postsWithTranslations = posts.filter(post => {
        return post.translations?.some(translation => translation.locale === locale);
      });

      this.logger.debug(`Found ${postsWithTranslations.length} posts with translations in locale ${locale}`);

      // Map the posts to include only the translation for the requested locale
      return postsWithTranslations.map(post => ({
        ...post,
        translations: post.translations.filter(translation => translation.locale === locale)
      }));
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

  async findRelatedPosts(id: number, limit = 3): Promise<Post[]> {
    // Lấy bài viết hiện tại để tìm các bài viết liên quan
    const currentPost = await this.postRepository.findOne({
      where: { id, published: true }
    });

    if (!currentPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Tìm các bài viết cùng tác giả hoặc có từ khóa tương tự
    const relatedPosts: Post[] = [];
    
    // Nếu có từ khóa, tìm bài viết có từ khóa tương tự
    if (currentPost.metaKeywords) {
      const keywords = currentPost.metaKeywords.split(',').map(k => k.trim());
      
      // Tìm bài viết có từ khóa tương tự
      for (const keyword of keywords) {
        const keywordPosts = await this.postRepository.find({
          where: { 
            metaKeywords: ILike(`%${keyword}%`),
            published: true,
            id: Not(id)
          },
          order: { createdAt: 'DESC' },
          take: limit
        });
        
        // Thêm các bài viết không trùng lặp
        for (const post of keywordPosts) {
          if (!relatedPosts.some(p => p.id === post.id)) {
            relatedPosts.push(post);
            if (relatedPosts.length >= limit) break;
          }
        }
        
        if (relatedPosts.length >= limit) break;
      }
    }
    
    // Nếu không đủ bài viết liên quan, tìm thêm bài viết cùng tác giả
    if (relatedPosts.length < limit) {
      const authorPosts = await this.postRepository.find({
        where: { 
          authorId: currentPost.authorId,
          published: true,
          id: Not(id)
        },
        order: { createdAt: 'DESC' },
        take: limit - relatedPosts.length
      });
      
      // Thêm các bài viết không trùng lặp
      for (const post of authorPosts) {
        if (!relatedPosts.some(p => p.id === post.id)) {
          relatedPosts.push(post);
          if (relatedPosts.length >= limit) break;
        }
      }
    }
    
    // Nếu vẫn không đủ, lấy các bài viết mới nhất
    if (relatedPosts.length < limit) {
      const recentPosts = await this.postRepository.find({
        where: { 
          published: true,
          id: Not(id)
        },
        order: { createdAt: 'DESC' },
        take: limit - relatedPosts.length
      });
      
      // Thêm các bài viết không trùng lặp
      for (const post of recentPosts) {
        if (!relatedPosts.some(p => p.id === post.id)) {
          relatedPosts.push(post);
          if (relatedPosts.length >= limit) break;
        }
      }
    }
    
    return relatedPosts;
  }

  async findPopularPosts(limit = 5, excludeId?: number): Promise<Post[]> {
    // Trong thực tế, bạn có thể dựa vào số lượt xem, lượt thích, bình luận, v.v.
    // Ở đây, chúng ta sẽ giả định bài viết phổ biến dựa trên một số tiêu chí đơn giản
    
    // Điều kiện cơ bản: bài viết được xuất bản
    const whereCondition: any = { published: true };
    
    // Nếu có excludeId, loại trừ bài viết hiện tại
    if (excludeId) {
      whereCondition.id = Not(excludeId);
    }
    
    // Ví dụ: Lấy các bài viết có hình ảnh (ogImage) và được xuất bản
    const postsWithImage = await this.postRepository.find({
      where: { 
        ...whereCondition,
        ogImage: Not('') // Có hình ảnh
      },
      order: { 
        createdAt: 'DESC' // Sắp xếp theo thời gian tạo mới nhất
      },
      take: limit
    });
    
    // Nếu không đủ bài viết có hình ảnh, lấy thêm các bài viết mới nhất
    if (postsWithImage.length < limit) {
      // Lấy ID của các bài viết đã có
      const existingIds = postsWithImage.map(p => p.id);
      
      // Điều kiện để lấy thêm bài viết
      const additionalWhereCondition: any = { 
        published: true,
        id: Not(In(existingIds)) // Loại trừ các bài viết đã có
      };
      
      // Nếu có excludeId và chưa có trong existingIds, thêm vào điều kiện loại trừ
      if (excludeId && !existingIds.includes(excludeId)) {
        // Cập nhật điều kiện để loại trừ cả bài viết hiện tại
        additionalWhereCondition.id = Not(In([...existingIds, excludeId]));
      }
      
      // Lấy thêm bài viết mới nhất
      const remainingPosts = await this.postRepository.find({
        where: additionalWhereCondition,
        order: { createdAt: 'DESC' },
        take: limit - postsWithImage.length
      });
      
      return [...postsWithImage, ...remainingPosts];
    }
    
    return postsWithImage;
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

  async findBySlug(slug: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { slug, published: true }
    });

    if (!post) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }
    return post;
  }

  async findBySlugWithAuthor(slug: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { slug, published: true },
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

  async findBySlugWithAuthorAndTags(slug: string, locale = 'vi'): Promise<IPost> {
    try {
      // First, find the translation to get the postId
      const translation = await this.postTranslationRepository.findOne({
        where: { slug, locale },
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

      const currentTranslation = post.translations.find(t => t.locale === locale);
      if (!currentTranslation) {
        throw new NotFoundException(`Translation not found for locale "${locale}"`);
      }

      const tags = post.postTags
        .map(pt => pt.tag)
        .filter(tag => tag.isActive)
        .map(tag => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          color: tag.color,
          description: tag.description,
          isActive: tag.isActive
        }));

      // Format response
      const authorProfile = await post.author.profile;
      const profile = authorProfile ? {
        id: authorProfile.id,
        firstName: authorProfile.firstName,
        lastName: authorProfile.lastName,
        phoneNumber: authorProfile.phoneNumber,
        phoneCode: authorProfile.phoneCode,
        address: authorProfile.address,
        createdAt: authorProfile.createdAt.toISOString(),
        updatedAt: authorProfile.updatedAt.toISOString()
      } : {
        id: null,
        firstName: null,
        lastName: null,
        phoneNumber: null,
        phoneCode: null,
        address: null,
        createdAt: null,
        updatedAt: null
      };

      return {
        id: post.id,
        title: currentTranslation.title,
        content: currentTranslation.content,
        shortDescription: currentTranslation.shortDescription,
        published: post.published,
        authorId: post.authorId,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        // Additional fields
        tags,
        author: {
          id: post.author.id,
          email: post.author.email,
          username: post.author.username,
          isEmailVerified: post.author.isEmailVerified,
          isActive: post.author.isActive,
          lastLoginAt: post.author.lastLoginAt,
          createdAt: post.author.createdAt,
          updatedAt: post.author.updatedAt,
          profile
        },
        // Add full translations array
        translations: post.translations.map(t => ({
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
        }))
      };
    } catch (error) {
      this.logger.error('Error in findBySlugWithAuthorAndTags:', error);
      throw new NotFoundException(`Failed to retrieve post with slug "${slug}"`);
    }
  }

  async findByIdWithAuthorAndTags(id: number): Promise<any> {
    const post = await this.postRepository.findOne({
      where: { id, published: true },
      relations: ['author', 'author.profile', 'categories']
    });

    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }

    // Lấy tags của bài viết
    const postTags = await this.postTagRepository.find({
      where: { postId: post.id },
      relations: ['tag']
    });

    const tags = postTags.map(pt => pt.tag).filter(tag => tag.isActive);

    // Đảm bảo author đã được load
    const author = post.author instanceof Promise ? await post.author : post.author;
    // Đảm bảo profile đã được load
    const authorProfile = author?.profile instanceof Promise ? await author.profile : author?.profile || {};

    return {
      ...post,
      tags,
      __author__: {
        ...author,
        __profile__: authorProfile
      }
    };
  }
} 