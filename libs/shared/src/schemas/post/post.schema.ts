import { z } from 'zod';

// Base post schema với các trường cơ bản
const basePostSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).optional(),
  published: z.boolean().optional().default(false),
  authorId: z.number(),
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

// Create post schema
export const createPostSchema = basePostSchema.merge(seoFieldsSchema);

// Update post schema
export const updatePostSchema = basePostSchema.merge(seoFieldsSchema).partial().extend({
  id: z.number(),
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