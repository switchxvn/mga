import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { UpdateProfileDto } from '../../profile/dto/update-profile.dto';
import { protectedProcedure, router } from '../procedures';
import { ProfileResponse } from '@ew/shared';
import { ProfileTransformer } from '../../profile/transformers/profile.transformer';

export const profileRouter = router({
  // Get current user's profile
  getMyProfile: protectedProcedure.query(async ({ ctx }): Promise<ProfileResponse> => {
    try {      
      const user = await ctx.services.userService.findById(ctx.user.id);
      if (!user) {
        console.error('User not found:', ctx.user.id);
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }
      console.log('Found user:', { id: user.id, email: user.email });

      try {
        return await ProfileTransformer.toFullProfileResponse(user);
      } catch (profileError) {
        console.error('Error fetching profile:', profileError);
        // If profile fetch fails, return user data without profile
        return {
          id: user.id,
          email: user.email,
          roles: user.roles?.map(role => role.name) || [],
          isEmailVerified: user.isEmailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          profile: null
        };
      }
    } catch (error) {
      console.error('Error in getMyProfile:', error);
      if (error instanceof TRPCError) {
        throw error;
      }
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get profile',
        cause: error,
      });
    }
  }),

  // Update current user's profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phoneCode: z.string().optional(),
        phoneNumber: z.string().optional(),
        address: z.object({
          street: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          country: z.string().optional(),
          zipCode: z.string().optional(),
        }).optional(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<ProfileResponse> => {
      try {
        console.log('Updating profile for user ID:', ctx.user.id);
        
        const user = await ctx.services.userService.findById(ctx.user.id);
        if (!user) {
          console.error('User not found:', ctx.user.id);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }
        console.log('Found user:', { id: user.id, email: user.email });

        const updateProfileDto = input as UpdateProfileDto;
        await ctx.services.profileService.updateProfile(ctx.user.id, updateProfileDto);
        
        // Fetch updated user data
        const updatedUser = await ctx.services.userService.findById(ctx.user.id);
        console.log('Profile updated successfully');

        return await ProfileTransformer.toFullProfileResponse(updatedUser);
      } catch (error) {
        console.error('Error in updateProfile:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update profile',
          cause: error,
        });
      }
    }),

  // Get profile by user ID
  getProfileById: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }): Promise<ProfileResponse> => {
      try {
        console.log('Getting profile for user ID:', input.userId);
        
        const user = await ctx.services.userService.findById(input.userId);
        if (!user) {
          console.error('User not found:', input.userId);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }
        console.log('Found user:', { id: user.id, email: user.email });

        return await ProfileTransformer.toFullProfileResponse(user);
      } catch (error) {
        console.error('Error in getProfileById:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get profile',
          cause: error,
        });
      }
    }),
}); 