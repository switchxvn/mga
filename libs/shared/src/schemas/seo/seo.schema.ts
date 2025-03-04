import { z } from 'zod';

export const createSeoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  keywords: z.string().optional(),
  canonicalUrl: z.string().optional(),
  pagePath: z.string(),
  robotsTxt: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateSeoSchema = createSeoSchema.partial();

export type CreateSeoInput = z.infer<typeof createSeoSchema>;
export type UpdateSeoInput = z.infer<typeof updateSeoSchema>; 