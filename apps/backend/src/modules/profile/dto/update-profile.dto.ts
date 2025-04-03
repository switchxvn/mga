import { z } from 'zod';

// Define the schema
export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  avatar: z.string().url().optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  phoneNumber: z.string().regex(/^\d+$/).optional().nullable(),
  phoneCode: z.string().max(4).optional().nullable(),
  address: z.object({
    street: z.string().max(200).optional().nullable(),
    city: z.string().max(100).optional().nullable(),
    state: z.string().max(100).optional().nullable(),
    country: z.string().max(100).optional().nullable(),
    zipCode: z.string().max(20).optional().nullable(),
  }).optional().nullable(),
});

// Export the type
export type UpdateProfileDto = z.infer<typeof updateProfileSchema>; 