import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { updateProfileSchema } from '../../profile/dto/update-profile.dto';

export const profileRouter = router({
  // Get current user's profile
  getMyProfile: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.services.profileService.getProfileByUserId(ctx.user.id);
    }),

  // Update current user's profile
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.services.profileService.updateProfile(ctx.user.id, input);
    }),

  // Get profile by user ID
  getProfileById: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.services.profileService.getProfileByUserId(input.userId);
    }),
}); 