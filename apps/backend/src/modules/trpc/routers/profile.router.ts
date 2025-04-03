import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../trpc';
import { UpdateProfileDto } from '../../profile/dto/update-profile.dto';
import { UserProfile } from '../../profile/entities/user-profile.entity';
import { CountryPhoneCode } from '../../common/entities/country-phone-code.entity';

// Define the response type to match entity structure
type UserResponse = {
  id: number;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile: {
    id: number;
    userId: number;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    phoneCode: string | null;
    bio: string | null;
    address: {
      street: string | null;
      city: string | null;
      state: string | null;
      country: string | null;
      zipCode: string | null;
    };
    countryPhoneCode: {
      phoneCode: string;
      countryCode: string;
      countryName: string;
      isActive: boolean;
      flagIcon: string | null;
      flagEmoji: string | null;
      createdAt: Date;
      updatedAt: Date;
    } | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
};

export const profileRouter = router({
  // Get current user's profile
  getMyProfile: protectedProcedure.query(async ({ ctx }): Promise<UserResponse> => {
    try {
      const user = await ctx.services.userService.findById(ctx.user.id);
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const profile = await ctx.services.profileService.getProfileByUserId(ctx.user.id);

      return {
        id: user.id,
        email: user.email,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile: profile || null
      };
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
        address: z.object({
          street: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          country: z.string().optional(),
          zipCode: z.string().optional(),
        }).optional(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<UserResponse> => {
      try {
        const user = await ctx.services.userService.findById(ctx.user.id);
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        const updateProfileDto = input as UpdateProfileDto;
        const updatedProfile = await ctx.services.profileService.updateProfile(ctx.user.id, updateProfileDto);

        return {
          id: user.id,
          email: user.email,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          profile: updatedProfile
        };
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
    .query(async ({ ctx, input }): Promise<UserResponse> => {
      try {
        const user = await ctx.services.userService.findById(input.userId);
        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        const profile = await ctx.services.profileService.getProfileByUserId(input.userId);

        return {
          id: user.id,
          email: user.email,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          profile: profile || null
        };
      } catch (error) {
        console.error('Error in getProfileById:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get profile',
          cause: error,
        });
      }
    }),
}); 