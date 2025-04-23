import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TRPCError } from '@trpc/server';
import { Repository } from 'typeorm';
import { CountryPhoneCode } from '../../common/entities/country-phone-code.entity';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UserProfile } from '../entities/user-profile.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly profileRepository: Repository<UserProfile>,
    @InjectRepository(CountryPhoneCode)
    private readonly countryPhoneCodeRepository: Repository<CountryPhoneCode>,
  ) {}

  async getProfileByUserId(userId: string): Promise<UserProfile> {
    try {
      const profile = await this.profileRepository.findOne({
        where: { userId },
        relations: ['countryPhoneCode', 'user', 'user.roles', 'user.permissions'],
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

  async updateProfile(userId: string, data: UpdateProfileDto): Promise<UserProfile> {
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

      return await this.profileRepository.save(profile);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update profile',
        cause: error,
      });
    }
  }

  async createUserProfile(data: { userId: string, firstName?: string, lastName?: string }): Promise<UserProfile> {
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

      return await this.profileRepository.save(profile);
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create user profile',
        cause: error,
      });
    }
  }

  async findOne(userId: string): Promise<UserProfile | null> {
    const profile = await this.profileRepository.findOne({
      where: { userId },
      relations: ['countryPhoneCode'],
    });

    return profile;
  }

  async update(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
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

    return await this.profileRepository.save(profile);
  }
} 