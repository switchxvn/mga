import { z } from 'zod';

// Base post schema với các trường cơ bản
const basePostSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).optional(),
  published: z.boolean().optional().default(false),
  authorId: z.number(),
  thumbnail: z.string().nullable().optional(),
  shortDescription: z.string().optional(),
});

// SEO fields schema
const seoFieldsSchema = z.object({
  slug: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  canonicalUrl: z.string().optional(),
});

// Translation schema
const translationSchema = z.object({
  locale: z.string(),
  title: z.string(),
  content: z.string(),
  slug: z.string(),
  metaDescription: z.string().nullable().optional(),
  ogImage: z.string().nullable().optional()
});

// Create post schema
export const createPostSchema = basePostSchema.merge(seoFieldsSchema);

// Update post schema
export const updatePostSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  shortDescription: z.string().nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']),
  featuredImage: z.string().nullable().optional(),
  metaDescription: z.string().nullable().optional(),
  translations: z.array(translationSchema.extend({
    shortDescription: z.string().nullable().optional()
  })).optional(),
  tags: z.array(z.string()).optional(),
  categoryIds: z.array(z.number()).optional()
});

// Get post by ID schema
export const getPostByIdSchema = z.number();

// Get posts schema với các tùy chọn lọc và phân trang
export const getPostsSchema = z.object({
  page: z.number().optional().default(1),
  limit: z.number().optional().default(10),
  published: z.boolean().optional(),
  authorId: z.number().optional(),
  search: z.string().optional(),
  orderBy: z.enum(['createdAt', 'updatedAt', 'title']).optional().default('createdAt'),
  order: z.enum(['ASC', 'DESC']).optional().default('DESC'),
});

// Export types
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type GetPostByIdInput = z.infer<typeof getPostByIdSchema>;
export type GetPostsInput = z.infer<typeof getPostsSchema>; 