import { z } from 'zod';

// Zod schema for creating a footer
export const createFooterSchema = z.object({
  name: z.string(),
  type: z.string(),
  content: z.any(), // Consider making this more specific based on your needs
  isActive: z.boolean().optional().default(false),
});

// Zod schema for updating a footer
export const updateFooterSchema = createFooterSchema.partial();

// Types inferred from the schemas
export type CreateFooterInput = z.infer<typeof createFooterSchema>;
export type UpdateFooterInput = z.infer<typeof updateFooterSchema>; 