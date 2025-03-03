import { z } from 'zod';

// Menu Item Schemas
export const getMenuItemsSchema = z.object({
  parentId: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const getMenuItemByIdSchema = z.number();

export const createMenuItemSchema = z.object({
  label: z.string(),
  href: z.string(),
  parentId: z.number().nullable().optional(),
  order: z.number().optional(),
  hasMegaMenu: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const updateMenuItemSchema = z.object({
  id: z.number(),
  data: z.object({
    label: z.string().optional(),
    href: z.string().optional(),
    parentId: z.number().nullable().optional(),
    order: z.number().optional(),
    hasMegaMenu: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const deleteMenuItemSchema = z.number();

// Logo Schemas
export const getLogosSchema = z.object({
  type: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const getLogoByIdSchema = z.number();

export const createLogoSchema = z.object({
  url: z.string(),
  type: z.string(),
  alt: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateLogoSchema = z.object({
  id: z.number(),
  data: z.object({
    url: z.string().optional(),
    type: z.string().optional(),
    alt: z.string().optional(),
    width: z.string().optional(),
    height: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const deleteLogoSchema = z.number(); 