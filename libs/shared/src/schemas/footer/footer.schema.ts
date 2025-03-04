import { z } from 'zod';

const footerSectionSchema = z.object({
  type: z.string(),
  title: z.string().optional(),
  items: z.array(
    z.object({
      label: z.string(),
      url: z.string(),
    })
  ).optional(),
});

export const createFooterSchema = z.object({
  name: z.string(),
  type: z.enum(['simple', 'complex', 'custom']),
  content: z.object({
    sections: z.array(footerSectionSchema),
    copyright: z.string().optional(),
    theme: z.object({
      backgroundColor: z.string().optional(),
      textColor: z.string().optional(),
    }).optional(),
  }),
  isActive: z.boolean().optional().default(false),
});

export const updateFooterSchema = createFooterSchema.partial();

export type CreateFooterInput = z.infer<typeof createFooterSchema>;
export type UpdateFooterInput = z.infer<typeof updateFooterSchema>;
export type FooterSection = z.infer<typeof footerSectionSchema>; 