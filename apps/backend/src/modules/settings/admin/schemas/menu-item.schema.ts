import { z } from 'zod';

export const menuItemTranslationSchema = z.object({
  id: z.number().optional(), // Optional for creation
  label: z.string().min(1),
  locale: z.string().length(2)
});

// Base schema for common fields
const baseMenuItemSchema = z.object({
  defaultLocale: z.string().length(2).default('en'),
  href: z.string().min(1),
  hasMegaMenu: z.boolean().default(false),
  icon: z.string().optional().nullable(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
  parentId: z.number().nullable().optional(),
  megaMenuColumns: z.any().optional().nullable()
});

// Schema for creating a new menu item
export const createMenuItemSchema = baseMenuItemSchema.extend({
  translations: z.array(menuItemTranslationSchema).min(1)
});

// Schema for updating a menu item
export const updateMenuItemSchema = baseMenuItemSchema
  .extend({
    translations: z.array(menuItemTranslationSchema).min(1)
  })
  .partial();

// Schema for listing menu items (includes IDs and timestamps)
export const menuItemSchema = baseMenuItemSchema.extend({
  id: z.number(),
  translations: z.array(menuItemTranslationSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
  children: z.lazy(() => z.array(menuItemSchema)).optional()
});

// Query params for list operation
export const menuItemsQuerySchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  orderBy: z.enum(['id', 'createdAt', 'updatedAt', 'order']).optional(),
  orderDirection: z.enum(['ASC', 'DESC']).optional(),
  parentId: z.number().nullable().optional()
});

// Response schema for list operation
export const menuItemsListSchema = z.object({
  items: z.array(menuItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number()
});

// Types
export type MenuItemTranslation = z.infer<typeof menuItemTranslationSchema>;
export type CreateMenuItem = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItem = z.infer<typeof updateMenuItemSchema>;
export type MenuItem = z.infer<typeof menuItemSchema>;
export type MenuItemsQuery = z.infer<typeof menuItemsQuerySchema>;
export type MenuItemsList = z.infer<typeof menuItemsListSchema>; 