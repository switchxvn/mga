import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../trpc';
import { UpdateProfileDto } from '../../profile/dto/update-profile.dto';

export const profileRouter = router({
  // Get current user's profile
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    try {
      const profile = await ctx.services.profileService.getProfileByUserId(ctx.user.id);
      console.log('Profile from router:', JSON.stringify(profile, null, 2));
      return profile;
    } catch (error) {
      console.error('Error in getMyProfile:', error);
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
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        zipCode: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const updateProfileDto = input as UpdateProfileDto;
        const updatedProfile = await ctx.services.profileService.updateProfile(ctx.user.id, updateProfileDto);
        console.log('Updated profile:', JSON.stringify(updatedProfile, null, 2));
        return updatedProfile;
      } catch (error) {
        console.error('Error in updateProfile:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update profile',
          cause: error,
        });
      }
    }),

  // Get profile by user ID
  getProfileById: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.services.profileService.getProfileByUserId(input.userId);
    }),
}); 