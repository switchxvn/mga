import { TRPCError } from '@trpc/server';
import { publicProcedure, router } from '../trpc';
import * as bcrypt from 'bcrypt';
import { loginSchema, registerSchema } from '../../auth/dto/auth.dto';
import { CreateUserDto } from '../../user/dto/create-user.dto';
import { User } from '../../user/entities/user.entity';

export const authRouter = router({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Attempting to register user: ${input.email}`);
        
        // Check if user already exists
        const existingUser = await ctx.services.userService.findByEmail(input.email);

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
        const newUser = await ctx.services.userService.create({
          email: input.email,
          password: hashedPassword,
          name: input.name,
          username: input.name?.toLowerCase().replace(/\s+/g, '_'),
          isActive: true,
          isEmailVerified: false,
        } as CreateUserDto);

        ctx.logger.log(`User registered successfully: ${newUser.email}`);

        // Remove password from response
        const { password, ...userWithoutPassword } = newUser;

        return {
          user: userWithoutPassword,
          accessToken: ctx.services.authService.generateToken(userWithoutPassword),
          message: 'User registered successfully',
        };
      } catch (error) {
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
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Login attempt: ${input.email}`);
        
        // Find user
        const user = await ctx.services.userService.findByEmail(input.email);

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
        await ctx.services.userService.update(user.id, { lastLoginAt: new Date() });
        ctx.logger.log(`User logged in successfully: ${user.email}`);
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        return {
          user: userWithoutPassword,
          accessToken: ctx.services.authService.generateToken(user),
        };
      } catch (error) {
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
        ctx.logger.log(`Fetching current user data for user ID: ${ctx.user.id}`);

        const user = await ctx.services.userService.findOne(ctx.user.id);
        
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        // Exclude sensitive information
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        ctx.logger.error(`Error fetching current user: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve current user',
          cause: error,
        });
      }
    }),
}); 