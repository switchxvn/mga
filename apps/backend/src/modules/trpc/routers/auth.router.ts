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
      } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Registration error: ${error instanceof Error ? error.message : String(error)}`);
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
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        // Generate JWT token
        const tokenData = {
          sub: user.id,
          email: user.email,
        };
        
        // Sử dụng NestJS JWT service để tạo token
        // Trong thực tế, bạn cần inject AuthService vào TrpcService và sử dụng nó ở đây
        // Tạm thời, chúng ta sẽ trả về tokenData để frontend có thể sử dụng
        
        return {
          user: userWithoutPassword,
          tokenData,
          token: btoa(JSON.stringify(tokenData)), // Tạo một token giả để frontend sử dụng
        };
      } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Login error: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to login',
          cause: error,
        });
      }
    }),

  logout: publicProcedure
    .mutation(async ({ ctx }) => {
      try {
        ctx.logger.log('Processing logout request');
        // In a stateless JWT setup, we don't need to do anything server-side
        // The client should remove the token
        ctx.logger.debug('Logout processed successfully');
        return { success: true, message: 'Logged out successfully' };
      } catch (error: unknown) {
        ctx.logger.error(`Logout error: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to logout',
          cause: error,
        });
      }
    }),

  me: publicProcedure
    .query(async ({ ctx }) => {
      try {
        if (!ctx.user) {
          ctx.logger.debug('Me endpoint accessed without authentication');
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Not authenticated',
          });
        }
        
        ctx.logger.log(`Fetching current user data for user ID: ${ctx.user.id}`);
        
        const user = await ctx.repositories.users.findOne({
          where: { id: ctx.user.id },
          select: ['id', 'email', 'name', 'isActive', 'isEmailVerified', 'createdAt', 'updatedAt'],
        });
        
        if (!user) {
          ctx.logger.warn(`User not found for ID: ${ctx.user.id}`);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }
        
        ctx.logger.debug(`Successfully retrieved user data for ID: ${ctx.user.id}`);
        return user;
      } catch (error: unknown) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error fetching current user data: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve user data',
          cause: error,
        });
      }
    }),
}); 