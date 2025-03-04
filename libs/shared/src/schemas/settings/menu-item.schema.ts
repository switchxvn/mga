import { z } from 'zod';
import { dateTransformer } from '../../transformers/date.transformer';

// Mega menu schemas
export const menuItemLinkSchema = z.object({
  label: z.string(),
  href: z.string(),
});

export const menuColumnSchema = z.object({
  title: z.string(),
  items: z.array(menuItemLinkSchema),
});

const baseMenuItemSchema = {
  label: z.string(),
  href: z.string(),
  parentId: z.number().nullable().optional(),
  order: z.number().optional(),
  hasMegaMenu: z.boolean().optional(),
  isActive: z.boolean().optional(),
  megaMenuColumns: z.array(menuColumnSchema).optional(),
} as const;

export const menuItemSchema = z.object({
  id: z.number(),
  ...baseMenuItemSchema,
  parentId: z.number().nullable(),
  order: z.number(),
  hasMegaMenu: z.boolean(),
  isActive: z.boolean(),
  megaMenuColumns: z.array(menuColumnSchema).optional(),
  createdAt: z.date().transform(dateTransformer.serialize),
  updatedAt: z.date().transform(dateTransformer.serialize),
});

export const createMenuItemSchema = z.object({
  ...baseMenuItemSchema,
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
export type MenuItemLink = z.infer<typeof menuItemLinkSchema>;
export type MenuColumn = z.infer<typeof menuColumnSchema>;
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
export type GetMenuItemsInput = z.infer<typeof getMenuItemsSchema>; 