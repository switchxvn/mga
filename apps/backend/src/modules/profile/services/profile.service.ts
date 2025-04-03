import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../entities/user-profile.entity';
import { CountryPhoneCode } from '../../common/entities/country-phone-code.entity';
import { TRPCError } from '@trpc/server';
import { UpdateProfileDto } from '../dto/update-profile.dto';

type ProfileResponse = {
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
    id: number;
    code: string;
    phoneCode: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly profileRepository: Repository<UserProfile>,
    @InjectRepository(CountryPhoneCode)
    private readonly countryPhoneCodeRepository: Repository<CountryPhoneCode>,
  ) {}

  async getProfileByUserId(userId: number): Promise<ProfileResponse> {
    try {
      const profile = await this.profileRepository.findOne({
        where: { userId },
        relations: ['countryPhoneCode'],
      });

      if (!profile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Profile not found',
        });
      }

      return {
        id: profile.id,
        userId: profile.userId,
        firstName: profile.firstName || null,
        lastName: profile.lastName || null,
        phoneNumber: profile.phoneNumber || null,
        phoneCode: profile.phoneCode || null,
        bio: profile.bio || null,
        address: {
          street: profile.address?.street || null,
          city: profile.address?.city || null,
          state: profile.address?.state || null,
          country: profile.address?.country || null,
          zipCode: profile.address?.zipCode || null,
        },
        countryPhoneCode: profile.countryPhoneCode ? {
          id: profile.countryPhoneCode.id,
          code: profile.countryPhoneCode.code,
          phoneCode: profile.countryPhoneCode.phoneCode,
        } : null,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve profile',
        cause: error,
      });
    }
  }

  async updateProfile(userId: number, data: UpdateProfileDto): Promise<ProfileResponse> {
    try {
      let profile = await this.profileRepository.findOne({
        where: { userId },
        relations: ['countryPhoneCode'],
      });

      if (!profile) {
        profile = this.profileRepository.create({
          userId,
        });
      }

      // Update profile fields
      Object.assign(profile, {
        ...data,
        address: {
          ...(profile.address || {}),
          ...(data.address || {}),
        },
      });

      // If phone code is provided, validate and set country phone code
      if (data.phoneCode) {
        const countryPhoneCode = await this.countryPhoneCodeRepository.findOne({
          where: { phoneCode: data.phoneCode }
        });

        if (!countryPhoneCode) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid phone code',
          });
        }

        profile.phoneCode = data.phoneCode;
        profile.countryPhoneCode = countryPhoneCode;
      }

      const updatedProfile = await this.profileRepository.save(profile);
      
      return {
        id: updatedProfile.id,
        userId: updatedProfile.userId,
        firstName: updatedProfile.firstName || null,
        lastName: updatedProfile.lastName || null,
        phoneNumber: updatedProfile.phoneNumber || null,
        phoneCode: updatedProfile.phoneCode || null,
        bio: updatedProfile.bio || null,
        address: {
          street: updatedProfile.address?.street || null,
          city: updatedProfile.address?.city || null,
          state: updatedProfile.address?.state || null,
          country: updatedProfile.address?.country || null,
          zipCode: updatedProfile.address?.zipCode || null,
        },
        countryPhoneCode: updatedProfile.countryPhoneCode ? {
          id: updatedProfile.countryPhoneCode.id,
          code: updatedProfile.countryPhoneCode.code,
          phoneCode: updatedProfile.countryPhoneCode.phoneCode,
        } : null,
        createdAt: updatedProfile.createdAt,
        updatedAt: updatedProfile.updatedAt,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update profile',
        cause: error,
      });
    }
  }

  async createUserProfile(data: { userId: number, firstName?: string, lastName?: string }): Promise<ProfileResponse> {
    try {
      let profile = await this.profileRepository.findOne({
        where: { userId: data.userId },
        relations: ['countryPhoneCode'],
      });

      if (profile) {
        // Profile already exists, update it
        profile.firstName = data.firstName || profile.firstName;
        profile.lastName = data.lastName || profile.lastName;
      } else {
        // Create new profile
        profile = this.profileRepository.create({
          userId: data.userId,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
        });
      }

      const savedProfile = await this.profileRepository.save(profile);
      
      return {
        id: savedProfile.id,
        userId: savedProfile.userId,
        firstName: savedProfile.firstName || null,
        lastName: savedProfile.lastName || null,
        phoneNumber: savedProfile.phoneNumber || null,
        phoneCode: savedProfile.phoneCode || null,
        bio: savedProfile.bio || null,
        address: {
          street: savedProfile.address?.street || null,
          city: savedProfile.address?.city || null,
          state: savedProfile.address?.state || null,
          country: savedProfile.address?.country || null,
          zipCode: savedProfile.address?.zipCode || null,
        },
        countryPhoneCode: savedProfile.countryPhoneCode ? {
          id: savedProfile.countryPhoneCode.id,
          code: savedProfile.countryPhoneCode.code,
          phoneCode: savedProfile.countryPhoneCode.phoneCode,
        } : null,
        createdAt: savedProfile.createdAt,
        updatedAt: savedProfile.updatedAt,
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create user profile',
        cause: error,
      });
    }
  }

  async findOne(userId: number): Promise<ProfileResponse | null> {
    const profile = await this.profileRepository.findOne({
      where: { userId },
      relations: ['countryPhoneCode'],
    });

    if (!profile) return null;

    return {
      id: profile.id,
      userId: profile.userId,
      firstName: profile.firstName || null,
      lastName: profile.lastName || null,
      phoneNumber: profile.phoneNumber || null,
      phoneCode: profile.phoneCode || null,
      bio: profile.bio || null,
      address: {
        street: profile.address?.street || null,
        city: profile.address?.city || null,
        state: profile.address?.state || null,
        country: profile.address?.country || null,
        zipCode: profile.address?.zipCode || null,
      },
      countryPhoneCode: profile.countryPhoneCode ? {
        id: profile.countryPhoneCode.id,
        code: profile.countryPhoneCode.code,
        phoneCode: profile.countryPhoneCode.phoneCode,
      } : null,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async update(userId: number, data: Partial<UserProfile>): Promise<ProfileResponse> {
    let profile = await this.profileRepository.findOne({
      where: { userId },
      relations: ['countryPhoneCode'],
    });

    if (!profile) {
      profile = this.profileRepository.create({
        userId,
        ...data
      });
    } else {
      Object.assign(profile, data);
    }

    const updatedProfile = await this.profileRepository.save(profile);
    
    return {
      id: updatedProfile.id,
      userId: updatedProfile.userId,
      firstName: updatedProfile.firstName || null,
      lastName: updatedProfile.lastName || null,
      phoneNumber: updatedProfile.phoneNumber || null,
      phoneCode: updatedProfile.phoneCode || null,
      bio: updatedProfile.bio || null,
      address: {
        street: updatedProfile.address?.street || null,
        city: updatedProfile.address?.city || null,
        state: updatedProfile.address?.state || null,
        country: updatedProfile.address?.country || null,
        zipCode: updatedProfile.address?.zipCode || null,
      },
      countryPhoneCode: updatedProfile.countryPhoneCode ? {
        id: updatedProfile.countryPhoneCode.id,
        code: updatedProfile.countryPhoneCode.code,
        phoneCode: updatedProfile.countryPhoneCode.phoneCode,
      } : null,
      createdAt: updatedProfile.createdAt,
      updatedAt: updatedProfile.updatedAt,
    };
  }
} 