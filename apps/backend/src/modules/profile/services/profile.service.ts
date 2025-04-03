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
  } | null;
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

      const countryPhoneCodeData = await profile.countryPhoneCode;

      return {
        id: profile.id,
        userId: profile.userId,
        firstName: profile.firstName || null,
        lastName: profile.lastName || null,
        phoneNumber: profile.phoneNumber || null,
        phoneCode: profile.phoneCode || null,
        bio: profile.bio || null,
        address: profile.address || {
          street: null,
          city: null,
          state: null,
          country: null,
          zipCode: null,
        },
        countryPhoneCode: countryPhoneCodeData ? {
          phoneCode: countryPhoneCodeData.phoneCode,
          countryCode: countryPhoneCodeData.countryCode,
          countryName: countryPhoneCodeData.countryName,
          isActive: countryPhoneCodeData.isActive,
          flagIcon: countryPhoneCodeData.flagIcon,
          flagEmoji: countryPhoneCodeData.flagEmoji,
          createdAt: countryPhoneCodeData.createdAt,
          updatedAt: countryPhoneCodeData.updatedAt,
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
          ...data,
          address: data.address || null,
        });
      } else {
        Object.assign(profile, {
          ...data,
          address: data.address || profile.address,
        });
      }

      if (data.phoneCode) {
        const countryPhoneCode = await this.countryPhoneCodeRepository.findOne({
          where: { phoneCode: data.phoneCode },
        });

        if (!countryPhoneCode) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: `Country phone code ${data.phoneCode} not found`,
          });
        }

        profile.phoneCode = data.phoneCode;
        profile.countryPhoneCode = Promise.resolve(countryPhoneCode);
      }

      const updatedProfile = await this.profileRepository.save(profile);
      const countryPhoneCodeData = await updatedProfile.countryPhoneCode;

      return {
        id: updatedProfile.id,
        userId: updatedProfile.userId,
        firstName: updatedProfile.firstName || null,
        lastName: updatedProfile.lastName || null,
        phoneNumber: updatedProfile.phoneNumber || null,
        phoneCode: updatedProfile.phoneCode || null,
        bio: updatedProfile.bio || null,
        address: updatedProfile.address || {
          street: null,
          city: null,
          state: null,
          country: null,
          zipCode: null,
        },
        countryPhoneCode: countryPhoneCodeData ? {
          phoneCode: countryPhoneCodeData.phoneCode,
          countryCode: countryPhoneCodeData.countryCode,
          countryName: countryPhoneCodeData.countryName,
          isActive: countryPhoneCodeData.isActive,
          flagIcon: countryPhoneCodeData.flagIcon,
          flagEmoji: countryPhoneCodeData.flagEmoji,
          createdAt: countryPhoneCodeData.createdAt,
          updatedAt: countryPhoneCodeData.updatedAt,
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
      const countryPhoneCodeData = await savedProfile.countryPhoneCode;
      
      return {
        id: savedProfile.id,
        userId: savedProfile.userId,
        firstName: savedProfile.firstName || null,
        lastName: savedProfile.lastName || null,
        phoneNumber: savedProfile.phoneNumber || null,
        phoneCode: savedProfile.phoneCode || null,
        bio: savedProfile.bio || null,
        address: savedProfile.address || {
          street: null,
          city: null,
          state: null,
          country: null,
          zipCode: null,
        },
        countryPhoneCode: countryPhoneCodeData ? {
          phoneCode: countryPhoneCodeData.phoneCode,
          countryCode: countryPhoneCodeData.countryCode,
          countryName: countryPhoneCodeData.countryName,
          isActive: countryPhoneCodeData.isActive,
          flagIcon: countryPhoneCodeData.flagIcon,
          flagEmoji: countryPhoneCodeData.flagEmoji,
          createdAt: countryPhoneCodeData.createdAt,
          updatedAt: countryPhoneCodeData.updatedAt,
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

    const countryPhoneCodeData = await profile.countryPhoneCode;

    return {
      id: profile.id,
      userId: profile.userId,
      firstName: profile.firstName || null,
      lastName: profile.lastName || null,
      phoneNumber: profile.phoneNumber || null,
      phoneCode: profile.phoneCode || null,
      bio: profile.bio || null,
      address: profile.address || {
        street: null,
        city: null,
        state: null,
        country: null,
        zipCode: null,
      },
      countryPhoneCode: countryPhoneCodeData ? {
        phoneCode: countryPhoneCodeData.phoneCode,
        countryCode: countryPhoneCodeData.countryCode,
        countryName: countryPhoneCodeData.countryName,
        isActive: countryPhoneCodeData.isActive,
        flagIcon: countryPhoneCodeData.flagIcon,
        flagEmoji: countryPhoneCodeData.flagEmoji,
        createdAt: countryPhoneCodeData.createdAt,
        updatedAt: countryPhoneCodeData.updatedAt,
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
    const countryPhoneCodeData = await updatedProfile.countryPhoneCode;
    
    return {
      id: updatedProfile.id,
      userId: updatedProfile.userId,
      firstName: updatedProfile.firstName || null,
      lastName: updatedProfile.lastName || null,
      phoneNumber: updatedProfile.phoneNumber || null,
      phoneCode: updatedProfile.phoneCode || null,
      bio: updatedProfile.bio || null,
      address: updatedProfile.address || {
        street: null,
        city: null,
        state: null,
        country: null,
        zipCode: null,
      },
      countryPhoneCode: countryPhoneCodeData ? {
        phoneCode: countryPhoneCodeData.phoneCode,
        countryCode: countryPhoneCodeData.countryCode,
        countryName: countryPhoneCodeData.countryName,
        isActive: countryPhoneCodeData.isActive,
        flagIcon: countryPhoneCodeData.flagIcon,
        flagEmoji: countryPhoneCodeData.flagEmoji,
        createdAt: countryPhoneCodeData.createdAt,
        updatedAt: countryPhoneCodeData.updatedAt,
      } : null,
      createdAt: updatedProfile.createdAt,
      updatedAt: updatedProfile.updatedAt,
    };
  }
} 