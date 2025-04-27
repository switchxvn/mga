import { Injectable } from '@nestjs/common';
import { AdminPost } from '@ew/shared';
import { Post } from '../entities/post.entity';
import { Category } from '../../category/entities/category.entity';
import { User } from '../../user/entities/user.entity';
import { PostTranslation } from '../entities/post-translation.entity';
import { CategoryTranslation } from '../../category/entities/category-translation.entity';
import { PostTag } from '../entities/post-tag.entity';

@Injectable()
export class PostTransformer {
  toAdminPost(post: Post): AdminPost {
    if (!post) return null;

    const author = post.author as User & { profile: { name: string } };

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      published: post.published,
      shortDescription: post.shortDescription,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      thumbnail: post.thumbnail,
      translations: post.translations?.map((translation: PostTranslation) => ({
        locale: translation.locale,
        title: translation.title,
        slug: translation.slug,
        content: translation.content,
        shortDescription: translation.shortDescription,
        metaDescription: translation.metaDescription,
        ogImage: translation.ogImage
      })) || [],
      categories: post.categories?.map((category: Category) => ({
        id: category.id,
        name: category.translations?.[0]?.name || '',
        type: category.type,
        translations: category.translations?.map((trans: CategoryTranslation) => ({
          name: trans.name,
          locale: trans.locale
        })) || []
      })) || [],
      postTags: post.postTags?.map((postTag: PostTag) => ({
        id: postTag.tag.id,
        name: postTag.tag.name,
        slug: postTag.tag.slug
      })) || [],
      author: author ? {
        id: Number(author.id),
        name: author.profile?.name || '',
        email: author.email
      } : null
    };
  }

  toAdminPosts(posts: Post[]): AdminPost[] {
    return posts?.map(post => this.toAdminPost(post)) || [];
  }
} 