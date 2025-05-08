import { z } from 'zod';

// DTO for gallery translation input
export const galleryTranslationSchema = z.object({
  locale: z.string().length(2),
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
});

export type GalleryTranslationInput = z.infer<typeof galleryTranslationSchema>;

// DTO for creating a gallery
export const createGallerySchema = z.object({
  image: z.string().url(),
  isActive: z.boolean().optional().default(true),
  sequence: z.number().int().min(0).optional().default(0),
  categoryIds: z.array(z.number().int().positive()).optional().default([]),
  translations: z.array(galleryTranslationSchema).min(1),
});

export type CreateGalleryInput = z.infer<typeof createGallerySchema>;

// DTO for updating a gallery
export const updateGallerySchema = z.object({
  id: z.number().int().positive(),
  image: z.string().url().optional(),
  isActive: z.boolean().optional(),
  sequence: z.number().int().min(0).optional(),
  categoryIds: z.array(z.number().int().positive()).optional(),
  translations: z.array(galleryTranslationSchema).optional(),
});

export type UpdateGalleryInput = z.infer<typeof updateGallerySchema>;

// DTO for gallery query options
export const galleryQuerySchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(10),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  categoryId: z.number().int().positive().optional(),
});

export type GalleryQueryOptions = z.infer<typeof galleryQuerySchema>; 