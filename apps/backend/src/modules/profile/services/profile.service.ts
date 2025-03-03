import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfile, CountryPhoneCode } from '@ew/database';
import { TRPCError } from '@trpc/server';
import { UpdateProfileDto } from '../dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(CountryPhoneCode)
    private readonly countryPhoneCodeRepository: Repository<CountryPhoneCode>,
  ) {}

  async getProfileByUserId(userId: number) {
    try {
      const profile = await this.userProfileRepository.findOne({
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
      let profile = await this.userProfileRepository.findOne({
        where: { userId },
      });

      if (!profile) {
        profile = this.userProfileRepository.create({
          userId,
        });
      }

      // Update profile fields
      Object.assign(profile, data);

      // If phone code is provided, validate and set country phone code
      if (data.phoneCode) {
        const countryPhoneCode = await this.countryPhoneCodeRepository.findOne({
          where: { phoneCode: data.phoneCode },
        });

        if (!countryPhoneCode) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Invalid phone code',
          });
        }

        profile.countryPhoneCode = countryPhoneCode;
      }

      const updatedProfile = await this.userProfileRepository.save(profile);
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
} 