import { z } from 'zod';

// Create post schema
export const createPostSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1),
});

// Update post schema
export const updatePostSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(100).optional(),
  content: z.string().min(1).optional(),
});

// Get post by ID schema
export const getPostByIdSchema = z.number();

// Export types
export type CreatePostDto = z.infer<typeof createPostSchema>;
export type UpdatePostDto = z.infer<typeof updatePostSchema>;
export type GetPostByIdDto = z.infer<typeof getPostByIdSchema>;