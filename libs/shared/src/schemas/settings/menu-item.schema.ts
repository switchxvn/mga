import { z } from 'zod';
import { dateTransformer } from '../../transformers/date.transformer';

// Menu item translation schema
export const menuItemTranslationSchema = z.object({
  id: z.number().optional(),
  label: z.string(),
  href: z.string(),
  locale: z.string().length(2),
  menuItemId: z.number().optional(),
});

const baseMenuItemSchema = {
  parentId: z.number().nullable().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
  translations: z.array(menuItemTranslationSchema).optional(),
} as const;

export const menuItemSchema = z.object({
  id: z.number(),
  ...baseMenuItemSchema,
  parentId: z.number().nullable(),
  order: z.number(),
  isActive: z.boolean(),
  translations: z.array(menuItemTranslationSchema),
  createdAt: z.date().transform(dateTransformer.serialize),
  updatedAt: z.date().transform(dateTransformer.serialize),
});

export const createMenuItemSchema = z.object({
  ...baseMenuItemSchema,
  translations: z.array(menuItemTranslationSchema),
}).required();

export const updateMenuItemSchema = z.object({
  id: z.number(),
  data: z.object({
    ...baseMenuItemSchema,
  }).partial(),
}).required();

export const getMenuItemsSchema = z.object({
  parentId: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const getMenuItemByIdSchema = z.number();
export const deleteMenuItemSchema = z.number();

// Type inference
export type MenuItem = z.infer<typeof menuItemSchema>;
export type MenuItemTranslation = z.infer<typeof menuItemTranslationSchema>;
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
export type GetMenuItemsInput = z.infer<typeof getMenuItemsSchema>; 