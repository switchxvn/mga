import { z } from 'zod';
import { dateTransformer } from '../../transformers/date.transformer';

export const getLogosSchema = z.object({
  type: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const getLogoByIdSchema = z.number();

export const createLogoSchema = z.object({
  url: z.string().url(),
  type: z.string(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  isActive: z.boolean().optional().default(true),
}).required();

export const updateLogoSchema = z.object({
  id: z.number(),
  data: z.object({
    url: z.string().url().optional(),
    type: z.string().optional(),
    alt: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    isActive: z.boolean().optional(),
  }).required(),
}).required();

export const deleteLogoSchema = z.number();

// Type inference
export type Logo = z.infer<typeof createLogoSchema> & {
  id: number;
  createdAt: string;
  updatedAt: string;
};
export type CreateLogoInput = z.infer<typeof createLogoSchema>;
export type UpdateLogoInput = z.infer<typeof updateLogoSchema>;
export type GetLogosInput = z.infer<typeof getLogosSchema>; 