import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { UpdateProfileDto } from '../../profile/dto/update-profile.dto';
import { protectedProcedure, router } from '../procedures';

// Define the response type to match entity structure
type UserResponse = {
  id: number;
  email: string;
  roles: string[];
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
      console.log('Getting profile for user ID:', ctx.user.id);
      
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
        const profile = await ctx.services.profileService.getProfileByUserId(ctx.user.id);
        console.log('Found profile:', profile ? 'yes' : 'no');

        return {
          id: user.id,
          email: user.email,
          roles: user.roles?.map(role => role.name) || [],
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          profile: profile || null
        };
      } catch (profileError) {
        console.error('Error fetching profile:', profileError);
        // If profile fetch fails, return user data without profile
        return {
          id: user.id,
          email: user.email,
          roles: user.roles?.map(role => role.name) || [],
          isActive: user.isActive,
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
    .mutation(async ({ ctx, input }): Promise<UserResponse> => {
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
        const updatedProfile = await ctx.services.profileService.updateProfile(ctx.user.id, updateProfileDto);
        console.log('Profile updated successfully');

        return {
          id: user.id,
          email: user.email,
          roles: user.roles?.map(role => role.name) || [],
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          profile: updatedProfile
        };
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
    .input(z.object({ userId: z.number() }))
    .query(async ({ ctx, input }): Promise<UserResponse> => {
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

        const profile = await ctx.services.profileService.getProfileByUserId(input.userId);
        console.log('Found profile:', profile ? 'yes' : 'no');

        return {
          id: user.id,
          email: user.email,
          roles: user.roles?.map(role => role.name) || [],
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          profile: profile || null
        };
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