import { z } from 'zod';

// Base schema for menu item
const menuItemBaseSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  href: z.string().min(1, 'Href is required'),
  icon: z.string().optional().nullable(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
  parentId: z.number().nullable().optional(),
});

// Schema for creating a new menu item
export const createMenuItemSchema = menuItemBaseSchema;

// Schema for updating an existing menu item
export const updateMenuItemSchema = z.object({
  id: z.number().int().positive(),
  ...menuItemBaseSchema.partial().shape
});

// Schema for getting a menu item by ID
export const getMenuItemByIdSchema = z.number().int().positive();

// Schema for getting menu items with filters
export const getMenuItemsSchema = z.object({
  parentId: z.number().optional(),
  isActive: z.boolean().optional(),
}).partial();

// Schema for deleting a menu item
export const deleteMenuItemSchema = z.number().int().positive(); 