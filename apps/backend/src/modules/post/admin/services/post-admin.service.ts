import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../entities/post.entity';
import { PostTranslation } from '../../entities/post-translation.entity';
import { CreatePostInput, UpdatePostInput } from '@ew/shared';
import { PostTag } from '../../entities/post-tag.entity';
import { Tag } from '../../../settings/entities/tag.entity';
import { Category } from '../../../category/entities/category.entity';

@Injectable()
export class PostAdminService {
  private readonly logger = new Logger(PostAdminService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostTranslation)
    private readonly postTranslationRepository: Repository<PostTranslation>,
    @InjectRepository(PostTag)
    private readonly postTagRepository: Repository<PostTag>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>
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

  async getPost(id: number, options?: { relations?: Record<string, any> }) {
    return this.postRepository.findOne({
      where: { id },
      relations: options?.relations || {
        translations: true,
        postTags: {
          tag: true
        },
        author: {
          profile: true
        }
      }
    });
  }

  async createPost(data: Partial<Post>) {
    const post = this.postRepository.create(data);
    return this.postRepository.save(post);
  }

  async findPostTranslationBySlug(slug: string): Promise<PostTranslation | null> {
    return this.postTranslationRepository.findOne({
      where: { slug },
      relations: ['post']
    });
  }

  async validateSlug(slug: string, postId?: number, translationId?: number): Promise<void> {
    const existingTranslation = await this.findPostTranslationBySlug(slug);
    
    if (existingTranslation) {
      // Allow the slug if we're updating the same translation
      if (translationId && existingTranslation.id === translationId) {
        return;
      }
      
      // Don't allow the slug if it exists in any translation (even for the same post)
      throw new BadRequestException(`Slug "${slug}" already exists in another translation`);
    }
  }

  async updatePost(id: number, data: UpdatePostInput): Promise<Post> {
    try {
      this.logger.debug('Received update data:', JSON.stringify(data, null, 2));

      // Find existing post with translations
      const existingPost = await this.postRepository.findOne({
        where: { id },
        relations: ['translations', 'postTags', 'categories']
      });

      if (!existingPost) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }

      // Update basic post information
      const postToUpdate = {
        title: data.title,
        content: data.content,
        shortDescription: data.shortDescription,
        published: data.status === 'PUBLISHED',
        thumbnail: data.featuredImage || existingPost.thumbnail,
      };

      // Update the post first
      await this.postRepository.update(id, postToUpdate);

      // Handle translations
      if (data.translations && data.translations.length > 0) {
        for (const translation of data.translations) {
          this.logger.debug('Processing translation:', {
            locale: translation.locale,
            receivedSlug: translation.slug,
            slugType: typeof translation.slug
          });

          // Find existing translation for this locale
          const existingTranslation = existingPost.translations?.find(
            t => t.locale === translation.locale
          );

          if (existingTranslation) {
            this.logger.debug('Found existing translation:', {
              id: existingTranslation.id,
              currentSlug: existingTranslation.slug
            });

            // Update existing translation
            const slugToUse = translation.slug ?? existingTranslation.slug;
            this.logger.debug('Will use slug:', slugToUse);

            // Validate slug before updating
            await this.validateSlug(slugToUse, id, existingTranslation.id);

            await this.postTranslationRepository.update(existingTranslation.id, {
              title: translation.title,
              content: translation.content,
              shortDescription: translation.shortDescription,
              slug: slugToUse,
              metaDescription: translation.metaDescription,
              ogImage: translation.ogImage
            });
          } else {
            this.logger.debug('Creating new translation');
            
            // Create new translation
            const slugToUse = translation.slug ?? this.generateSlug(translation.title);
            this.logger.debug('Will use slug for new translation:', slugToUse);

            // Validate slug before creating
            await this.validateSlug(slugToUse, id);

            const newTranslation = this.postTranslationRepository.create({
              ...translation,
              slug: slugToUse,
              postId: id
            });
            await this.postTranslationRepository.save(newTranslation);
          }
        }
      }

      // Handle tags if provided
      if (data.tags) {
        // Remove existing tags
        if (existingPost.postTags) {
          await this.postTagRepository.remove(existingPost.postTags);
        }

        // Add new tags
        for (const tagName of data.tags) {
          // Find or create tag
          let tag = await this.tagRepository.findOne({ where: { name: tagName } });
          if (!tag) {
            tag = await this.tagRepository.save(this.tagRepository.create({ 
              name: tagName,
              slug: tagName.toLowerCase().replace(/\s+/g, '-')
            }));
          }

          // Create post-tag relationship
          const postTag = this.postTagRepository.create({
            postId: id,
            tagId: tag.id
          });
          await this.postTagRepository.save(postTag);
        }
      }

      // Handle categories if provided
      if (data.categoryIds) {
        // Clear existing categories
        existingPost.categories = [];
        await this.postRepository.save(existingPost);

        // Set new categories
        existingPost.categories = await this.categoryRepository.findByIds(data.categoryIds);
        await this.postRepository.save(existingPost);
      }

      // Return updated post with all relations
      return this.postRepository.findOne({
        where: { id },
        relations: ['translations', 'postTags', 'postTags.tag', 'categories', 'categories.translations']
      });
    } catch (error) {
      this.logger.error('Error updating post:', error);
      throw error;
    }
  }

  // Helper method to generate slug
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a')
      .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e')
      .replace(/ì|í|ị|ỉ|ĩ/g, 'i')
      .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o')
      .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u')
      .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }

  async deletePost(id: number) {
    const post = await this.findOne(id);
    if (post) {
      await this.postRepository.delete(id);
      return { success: true };
    }
    return { success: false };
  }

  async findPostBySlug(slug: string): Promise<Post | null> {
    const translation = await this.postTranslationRepository.findOne({
      where: { slug },
      relations: ['post']
    });
    return translation?.post || null;
  }
} 