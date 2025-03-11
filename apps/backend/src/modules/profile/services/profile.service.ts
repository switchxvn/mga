import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile } from '../entities/user-profile.entity';
import { CountryPhoneCode } from '../../common/entities/country-phone-code.entity';
import { TRPCError } from '@trpc/server';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly profileRepository: Repository<UserProfile>,
    @InjectRepository(CountryPhoneCode)
    private readonly countryPhoneCodeRepository: Repository<CountryPhoneCode>,
  ) {}

  async getProfileByUserId(userId: number) {
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

      return profile;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve profile',
        cause: error,
      });
    }
  }

  async updateProfile(userId: number, data: UpdateProfileDto) {
    try {
      let profile = await this.profileRepository.findOne({
        where: { userId },
      });

      if (!profile) {
        profile = this.profileRepository.create({
          userId,
        });
      }

      // Update profile fields
      Object.assign(profile, data);

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
      }

      const updatedProfile = await this.profileRepository.save(profile);
      return updatedProfile;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update profile',
        cause: error,
      });
    }
  }

  async createUserProfile(data: { userId: number, firstName?: string, lastName?: string }) {
    try {
      let profile = await this.profileRepository.findOne({
        where: { userId: data.userId },
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

      return await this.profileRepository.save(profile);
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create user profile',
        cause: error,
      });
    }
  }

  async findOne(userId: number) {
    return this.profileRepository.findOne({
      where: { userId }
    });
  }

  async update(userId: number, data: Partial<UserProfile>) {
    let profile = await this.profileRepository.findOne({
      where: { userId }
    });

    if (!profile) {
      profile = this.profileRepository.create({
        userId,
        ...data
      });
    } else {
      Object.assign(profile, data);
    }

    return this.profileRepository.save(profile);
  }
} 