import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().optional(),
  name: z.string().optional(),
  bio: z.string().optional(),
  isEmailVerified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  lastLoginAt: z.date().optional(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>; 