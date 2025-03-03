import { z } from 'zod';

// Base user schema (common fields)
const userBaseSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50).optional(),
  password: z.string().min(6),
});

// Create user schema
export const createUserSchema = userBaseSchema;

// Update user schema
export const updateUserSchema = z.object({
  id: z.number(),
  ...userBaseSchema.partial().shape,
  isActive: z.boolean().optional(),
  isEmailVerified: z.boolean().optional(),
  lastLoginAt: z.date().optional(),
});

// Get user by ID schema
export const getUserByIdSchema = z.number();

// Export types
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
export type GetUserByIdDto = z.infer<typeof getUserByIdSchema>; 