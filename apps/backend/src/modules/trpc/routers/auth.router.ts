import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import * as bcrypt from 'bcrypt';

export const authRouter = router({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Attempting to register user: ${input.email}`);
        
        // Check if user already exists
        const existingUser = await ctx.repositories.users.findOne({
          where: { email: input.email },
        });

        if (existingUser) {
          ctx.logger.warn(`Registration failed: Email already exists: ${input.email}`);
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'User with this email already exists',
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(input.password, 10);

        // Create new user
        const newUser = ctx.repositories.users.create({
          email: input.email,
          password: hashedPassword,
          name: input.name,
          isActive: true,
          isEmailVerified: false,
        });

        const savedUser = await ctx.repositories.users.save(newUser);
        ctx.logger.log(`User registered successfully: ${savedUser.email}`);

        // Remove password from response
        const { password, ...userWithoutPassword } = savedUser;

        return {
          user: userWithoutPassword,
          message: 'User registered successfully',
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Registration error: ${error.message}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to register user',
          cause: error,
        });
      }
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Login attempt: ${input.email}`);
        
        // Find user
        const user = await ctx.repositories.users.findOne({
          where: { email: input.email },
          select: ['id', 'email', 'password', 'name', 'isActive'], // Ensure password is selected
        });

        if (!user) {
          ctx.logger.warn(`Login failed: User not found: ${input.email}`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }
        
        if (!user.isActive) {
          ctx.logger.warn(`Login failed: User inactive: ${input.email}`);
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'User account is inactive',
          });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(input.password, user.password);

        if (!isPasswordValid) {
          ctx.logger.warn(`Login failed: Invalid password for: ${input.email}`);
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid password',
          });
        }

        // Update last login time
        user.lastLoginAt = new Date();
        await ctx.repositories.users.save(user);
        ctx.logger.log(`User logged in successfully: ${user.email}`);

        // Generate JWT token - this should be handled by the service
        // We'll return a placeholder and let the service handle the actual token generation
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        return {
          user: userWithoutPassword,
          // The actual token will be generated in the service layer
          tokenData: {
            sub: user.id,
            email: user.email,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Login error: ${error.message}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process login',
          cause: error,
        });
      }
    }),

  logout: publicProcedure
    .mutation(async ({ ctx }) => {
      try {
        // In a stateless JWT setup, we don't need to do anything server-side
        // The client should remove the token
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
          cause: error,
        });
      }
    }),

  me: publicProcedure
    .query(async ({ ctx }) => {
      try {
        if (!ctx.user) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Not authenticated',
          });
        }
        
        const user = await ctx.repositories.users.findOne({
          where: { id: ctx.user.id },
          select: ['id', 'email', 'username', 'isActive', 'isEmailVerified', 'createdAt', 'updatedAt'],
        });
        
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }
        
        return user;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
          cause: error,
        });
      }
    }),
}); 